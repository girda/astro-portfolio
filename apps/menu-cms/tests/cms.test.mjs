import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {request as httpRequest} from 'node:http';
import {createMenuStore} from '../store.mjs';
import {startCms} from '../server.mjs';
import {createMenuView} from '../../streetfood/src/data/menu-view.mjs';
const category={name:'Test category',symbol:'☕',sortOrder:10,active:true};
const product=categoryId=>({categoryId,name:'Test product',description:'Fictional example',price:450,image:'coffee.webp',allergens:'Milch',time:5,sortOrder:100,available:true});

test('CMS persists categories/products, preserves stable IDs and protects stale edits',()=>{
 const folder=mkdtempSync(join(tmpdir(),'hirda-menu-cms-'));const path=join(folder,'menu.sqlite');let store=createMenuStore(path);
 try{
  assert.equal(store.read().catalogue.products.length,24);
  let state=store.saveCategory(category,{revision:1});const added=state.catalogue.categories.find(c=>c.name===category.name);
  state=store.saveProduct(product(added.id),{revision:state.revision});const row=state.catalogue.products.find(p=>p.name==='Test product');
  assert.equal(row.categoryId,added.id);
  assert.throws(()=>store.saveCategory({...added,name:'Stale'},{id:added.id,revision:1}),e=>e.status===409);
  assert.throws(()=>store.saveProduct({...row,categoryId:'missing'},{id:row.id,revision:state.revision}),e=>e.status===400);
  assert.throws(()=>store.saveProduct({...row,image:'missing.webp'},{id:row.id,revision:state.revision}),e=>e.status===400);
  assert.equal(store.read().revision,state.revision);
  state=store.saveProduct({...row,categoryId:'coffee',price:499},{id:row.id,revision:state.revision});
  store.close();store=createMenuStore(path);
  assert.equal(store.read().catalogue.products.find(p=>p.id===row.id).price,499);
  assert.equal(store.read().catalogue.products.find(p=>p.id===row.id).categoryId,'coffee');
 }finally{store.close();rmSync(folder,{recursive:true,force:true});}
});

test('menu view hides unavailable products and inactive categories without deleting data',()=>{
 const store=createMenuStore(':memory:');try{
  let state=store.read();const coffee=state.catalogue.categories.find(c=>c.id==='coffee');
  state=store.saveCategory({...coffee,active:false},{id:coffee.id,revision:state.revision});
  let menu=createMenuView(state.catalogue,'/preview/');assert.ok(!menu.categories.some(c=>c.id==='coffee'));assert.ok(!menu.products.some(p=>p.category==='coffee'));
  const burger=state.catalogue.products[0];state=store.saveProduct({...burger,available:false},{id:burger.id,revision:state.revision});
  menu=createMenuView(state.catalogue,'/preview/');assert.ok(!menu.products.some(p=>p.id===burger.id));assert.equal(state.catalogue.products.length,24);
  assert.ok(menu.products.every(p=>p.image.startsWith('/preview/assets/menu/')));
 }finally{store.close()}
});

test('local HTTP API enforces origin, content type, revision, body size and validation',async()=>{
 const app=await startCms({port:0,path:':memory:'});try{
  const request=(path,options={})=>fetch(app.url+path,options);
  assert.equal((await request('/api/catalogue')).status,200);
  const badHost=await new Promise((resolve,reject)=>{const req=httpRequest(app.url+'/api/catalogue',{headers:{Host:'evil.example'}},res=>{res.resume();resolve(res.statusCode)});req.on('error',reject);req.end()});
  assert.equal(badHost,403);
  assert.equal((await request('/api/catalogue',{headers:{Origin:'https://example.com'}})).status,403);
  assert.equal((await request('/api/catalogue',{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
  assert.equal((await request('/api/categories',{method:'POST',body:'{}'})).status,415);
  const send=(body,revision='1')=>request('/api/categories',{method:'POST',headers:{'Content-Type':'application/json','If-Match':revision},body:JSON.stringify(body)});
  assert.equal((await send(category,'')).status,428);
  assert.equal((await send({...category,name:''})).status,400);
  const response=await send(category);assert.equal(response.status,201);assert.equal((await response.json()).revision,2);
  assert.equal((await send(category)).status,409);
  assert.equal((await request('/api/categories',{method:'POST',headers:{'Content-Type':'application/json','If-Match':'2'},body:'x'.repeat(70000)})).status,413);
  assert.equal((await request('/api/products/missing',{method:'PUT',headers:{'Content-Type':'application/json','If-Match':'2'},body:JSON.stringify(product('coffee'))})).status,404);
  assert.equal((await request('/api/products',{method:'DELETE'})).status,405);
 }finally{await app.close()}
});
