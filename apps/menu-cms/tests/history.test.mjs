import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createMenuStore} from '../store.mjs';
import {startCms} from '../server.mjs';

test('history persists exact snapshots and excludes rejected writes',()=>{
 const directory=mkdtempSync(join(tmpdir(),'cms-history-')),path=join(directory,'menu.sqlite');
 let store=createMenuStore(path);
 try {
  assert.deepEqual(store.history(),{entries:[],nextBefore:null});
  const before=store.read().catalogue.products[0];
  store.saveProduct({...before,price:before.price+100,available:false},{id:before.id,revision:1});
  const [entry]=store.history().entries;
  assert.equal(entry.revision,2);assert.equal(entry.action,'update');assert.equal(entry.kind,'products');
  assert.deepEqual(entry.before,before);assert.equal(entry.after.price,before.price+100);assert.equal(entry.after.available,false);
  assert.ok(Number.isFinite(Date.parse(entry.createdAt)));
  assert.throws(()=>store.saveProduct({...before,price:500},{id:before.id,revision:1}),e=>e.status===409);
  assert.throws(()=>store.saveProduct({...before,price:-1},{id:before.id,revision:2}),e=>e.status===400);
  assert.equal(store.history().entries.length,1);assert.equal(store.read().revision,2);
  store.close();store=createMenuStore(path);assert.deepEqual(store.history().entries,[entry]);
 } finally {store.close();rmSync(directory,{recursive:true,force:true});}
});

test('history creates snapshots with bounded, stable cursor pagination',()=>{
 const store=createMenuStore(':memory:');
 try {
  for(let revision=1;revision<=5;revision++)store.saveCategory({name:'Category '+revision,symbol:'☕',sortOrder:revision,active:true},{revision});
  const first=store.history({limit:2});assert.deepEqual(first.entries.map(e=>e.revision),[6,5]);assert.equal(first.nextBefore,5);
  assert.equal(first.entries[0].before,null);assert.equal(first.entries[0].action,'create');
  const second=store.history({limit:2,before:first.nextBefore});assert.deepEqual(second.entries.map(e=>e.revision),[4,3]);
  const third=store.history({limit:2,before:second.nextBefore});assert.deepEqual(third.entries.map(e=>e.revision),[2]);assert.equal(third.nextBefore,null);
  for(const options of [{limit:51},{limit:0},{before:0},{before:1.5},{limit:NaN}])assert.throws(()=>store.history(options),e=>e.status===400);
 }finally{store.close();}
});

test('existing SQLite gains history without reseeding or fabricating previous events',()=>{
 const directory=mkdtempSync(join(tmpdir(),'cms-migration-')),path=join(directory,'menu.sqlite');
 let store=createMenuStore(path);const original=store.read().catalogue.products[0];
 store.saveProduct({...original,name:'Existing local edit'},{id:original.id,revision:1});store.close();
 const db=new DatabaseSync(path);db.exec('DROP TABLE history');db.close();
 store=createMenuStore(path);
 try {
  assert.equal(store.read().revision,2);assert.equal(store.read().catalogue.products.find(p=>p.id===original.id).name,'Existing local edit');
  assert.equal(store.history().entries.length,0);
  store.saveProduct({...original,price:900},{id:original.id,revision:2});
  assert.equal(store.history().entries[0].before.name,'Existing local edit');
 }finally{store.close();rmSync(directory,{recursive:true,force:true});}
});

test('history API validates cursors and applies local origin protection',async()=>{
 const app=await startCms({port:0,path:':memory:'});
 try {
  assert.deepEqual(await (await fetch(app.url+'/api/history')).json(),{entries:[],nextBefore:null});
  for(const query of ['?limit=100','?before=NaN','?before=0','?limit='])assert.equal((await fetch(app.url+'/api/history'+query)).status,400);
  assert.equal((await fetch(app.url+'/api/history',{headers:{Origin:'https://evil.example'}})).status,403);
  const row=(await app.store.read()).catalogue.products[0];await app.store.saveProduct({...row,name:'History API test'},{id:row.id,revision:1});
  const data=await(await fetch(app.url+'/api/history?limit=1')).json();assert.equal(data.entries[0].before.name,row.name);assert.equal(data.entries[0].after.name,'History API test');
 }finally{await app.close();}
});
