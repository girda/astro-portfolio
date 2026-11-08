import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {sqliteBinding} from '../sqlite-binding.mjs';
import {createRestaurantStore} from '../restaurants.mjs';
import {createCloudStore} from '../cloud/store.mjs';
import {createUserStore} from '../cloud/users.mjs';
import {createPublicationStore} from '../publications.mjs';
import {exportWorkspaceSql} from '../cloud/export-sql.mjs';
import {catalogueApi} from '../catalogue-api.mjs';
import {createMenuStore} from '../store.mjs';
import {localWorkspaces} from '../local-workspaces.mjs';
import {DEFAULT_SETTINGS} from '../../streetfood/src/data/menu-options.mjs';
const sql=name=>readFileSync(new URL('../cloud/'+name,import.meta.url),'utf8');
const seed=JSON.parse(readFileSync(new URL('../../streetfood/src/data/catalogue.json',import.meta.url)));
function setup(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON;');sqlite.exec(sql('schema.sql'));sqlite.exec(sql('migrations/0002-users.sql'));
 sqlite.prepare('INSERT INTO catalogue_state VALUES (1,7,?)').run(JSON.stringify({...seed,settings:{...DEFAULT_SETTINGS,title:'Preserved title'}}));
 sqlite.prepare('INSERT INTO catalogue_history VALUES (7,?)').run(JSON.stringify({revision:7,kind:'settings',createdAt:'2026-11-08T00:00:00Z',before:null,after:{title:'Preserved title'}}));
 sqlite.prepare("INSERT INTO cms_users(id,email,name,role,status,created_at) VALUES ('legacy-editor','legacy@example.com','Legacy Editor','editor','active','2026-11-01T00:00:00Z')").run();
 sqlite.exec(sql('migrations/0003-restaurants.sql'));sqlite.exec(sql('migrations/0004-publication.sql'));
 const db=sqliteBinding(sqlite),users=createUserStore(db),restaurants=createRestaurantStore(db),images=seed.products.map(p=>p.image);
 return {sqlite,db,users,restaurants,images};
}
async function person(users,email){let user=await users.identify({email,iat:1000});return users.profile(user,{name:'Test Owner'});}
const category={name:'Fresh category',symbol:'🍽️',sortOrder:10,active:true};
async function call(env,user,path,method='GET',body,revision){
 const response=await catalogueApi(new Request('https://cms.example'+path,{method,headers:{'Content-Type':'application/json',...(revision?{'If-Match':String(revision)}:{})},body:body===undefined?undefined:JSON.stringify(body)}),{...env,user});
 assert.ok(response);return {status:response.status,data:await response.json()};
}
test('two restaurants isolate catalogue, settings, history, revisions and guessed resource IDs',async()=>{
 const env=setup();const {users,restaurants,sqlite}=env;
 try{
  const a=await person(users,'a@example.com'),b=await person(users,'b@example.com');
  const ra=await restaurants.create(a,{name:'Cafe A',slug:'cafe-a'}),rb=await restaurants.create(b,{name:'Cafe B',slug:'cafe-b'});
  const route=(r,path)=>'/api/restaurants/'+r.id+'/'+path;
  assert.deepEqual((await restaurants.list(a)).map(r=>r.id),[ra.id]);
  assert.equal((await call(env,a,route(ra,'catalogue'))).data.catalogue.products.length,0);
  for(const path of ['catalogue','settings','history','history/query','images','products/guessed'])await assert.rejects(call(env,a,route(rb,path)),{status:404});
  await assert.rejects(call(env,a,route(rb,'categories'),'POST',category,1),{status:404});
  let state=(await call(env,a,route(ra,'categories'),'POST',category,1)).data;
  const cat=state.catalogue.categories[0];const product={...seed.products[0],categoryId:cat.id};delete product.id;
  state=(await call(env,a,route(ra,'products'),'POST',product,2)).data;
  const foreign=state.catalogue.products[0];
  await assert.rejects(call(env,b,route(rb,'products/'+foreign.id),'PUT',foreign,1),{status:404});
  await assert.rejects(call(env,b,route(rb,'products'),'POST',foreign,1),{status:400});
  await call(env,a,route(ra,'settings'),'PUT',{...DEFAULT_SETTINGS,title:'Only A'},3);
  assert.equal((await call(env,b,route(rb,'catalogue'))).data.revision,1);
  assert.equal((await call(env,b,route(rb,'catalogue'))).data.catalogue.settings.title,'Cafe B');
  assert.equal((await call(env,b,route(rb,'history/query')+'?q=Only%20A')).data.total,0);
  assert.equal((await call(env,a,route(ra,'history/query'))).data.total,3);
  await call(env,b,route(rb,'categories'),'POST',category,1); // ревизии независимы
  await assert.rejects(call(env,a,route(ra,'categories'),'POST',category,1),{status:409});
  assert.equal(await catalogueApi(new Request('https://cms.example/api/catalogue'),{...env,user:a}),null);
 }finally{sqlite.close();}
});
test('global editor does not bypass membership; viewer, blocked and pending cannot write/create',async()=>{
 const env=setup();try{
  const a=await person(env.users,'a@example.com'),b=await person(env.users,'b@example.com');const ra=await env.restaurants.create(a,{name:'Cafe A',slug:'cafe-a'});
  env.sqlite.prepare("UPDATE cms_users SET role='editor' WHERE id=?").run(b.id);
  const editor=await env.users.identify({email:b.email,iat:1001});await assert.rejects(env.restaurants.access(editor,ra.id),{status:404});
  env.sqlite.prepare("INSERT INTO restaurant_memberships VALUES (?,?,'viewer')").run(ra.id,b.id);
  assert.equal((await env.restaurants.access(editor,ra.id)).membership_role,'viewer');
  await assert.rejects(call(env,editor,'/api/restaurants/'+ra.id+'/categories','POST',category,1),{status:403});
  for(const status of ['blocked','pending']){
   env.sqlite.prepare('UPDATE cms_users SET status=? WHERE id=?').run(status,b.id);const denied=await env.users.identify({email:b.email,iat:1002});
   await assert.rejects(env.restaurants.list(denied),{status:403});await assert.rejects(env.restaurants.create(denied,{name:'Denied',slug:'denied'}),{status:403});await assert.rejects(env.restaurants.access(denied,ra.id),{status:403});
  }
  const superuser=await env.users.identify({email:'artem.girda@gmail.com',iat:1003});assert.equal((await env.restaurants.access(superuser,ra.id,true)).membership_role,'platform_admin');
 }finally{env.sqlite.close();}
});
test('registration is active but unprivileged; slug validation and unique conflicts are atomic',async()=>{
 const env=setup();try{
  const fresh=await env.users.identify({email:'fresh@example.com',iat:1000});assert.equal(fresh.status,'active');assert.deepEqual(await env.restaurants.list(fresh),[]);
  await assert.rejects(env.restaurants.create(fresh,{name:'Cafe',slug:'cafe'}),{status:400});
  const user=await env.users.profile(fresh,{name:'Owner'});
  for(const slug of ['app','www','-bad','ab','bad-','MiXeD','a'.repeat(64),'a.example','a--b'])await assert.rejects(env.restaurants.create(user,{name:'Cafe',slug}),{status:400});
  await env.restaurants.create(user,{name:'Cafe',slug:'new-cafe'});
  await assert.rejects(env.restaurants.create(user,{name:'Another',slug:'new-cafe'}),{status:409});
  assert.equal((await env.restaurants.list(user)).length,1);assert.equal(env.sqlite.prepare("SELECT COUNT(*) AS n FROM restaurant_catalogues WHERE restaurant_id<>'internal-demo'").get().n,1);
 }finally{env.sqlite.close();}
});
test('migration keeps legacy snapshots/settings/history and gives old editors no automatic ownership',async()=>{
 const env=setup();try{
  const owner=await env.users.identify({email:'artem.girda@gmail.com',iat:1000});const state=await createCloudStore(env.db,env.images,'internal-demo').read();assert.equal(state.revision,7);assert.equal(state.catalogue.settings.title,'Preserved title');
  assert.equal((await createCloudStore(env.db,env.images,'internal-demo').history()).entries.length,1);
  const editor=await person(env.users,'legacy@example.com');env.sqlite.prepare("UPDATE cms_users SET role='editor' WHERE id=?").run(editor.id);
  await assert.rejects(env.restaurants.access({...editor,role:'editor'},'internal-demo'),{status:404});
  assert.equal((await env.restaurants.list(owner)).length,1);assert.equal(env.sqlite.prepare('SELECT revision FROM catalogue_state').get().revision,7);
 }finally{env.sqlite.close();}
});
test('local migration backs up and preserves previous edits across reopening without reseeding',async()=>{
 const folder=mkdtempSync(join(tmpdir(),'cms-tenancy-')),path=join(folder,'menu.sqlite');
 try{
  const old=createMenuStore(path);old.saveSettings({...DEFAULT_SETTINGS,title:'Local before migration'},{revision:1});old.close();
  let local=localWorkspaces(path);let store=createCloudStore(local.db,local.images,'internal-demo');let state=await store.read();assert.equal(state.revision,2);assert.equal(state.catalogue.settings.title,'Local before migration');assert.equal((await store.history()).entries.length,1);
  assert.equal(readdirSync(folder).filter(name=>name.includes('.pre-restaurants-')).length,1);
  await store.save('settings',{...state.catalogue.settings,title:'After migration'},{revision:2});local.close();
  local=localWorkspaces(path);store=createCloudStore(local.db,local.images,'internal-demo');assert.equal((await store.read()).catalogue.settings.title,'After migration');assert.equal((await store.history()).entries.length,2);local.close();
  assert.equal(readdirSync(folder).filter(name=>name.includes('.pre-restaurants-')).length,1);
 }finally{rmSync(folder,{recursive:true,force:true});}
});

test('private export round-trip retains all restaurants/settings/history and rejects repeated import',async()=>{
 const env=setup(),restored=new DatabaseSync(':memory:');
 try{
  const user=await person(env.users,'cafe@example.com');const r=await env.restaurants.create(user,{name:"Cafe O'Clock",slug:'cafe-oclock'});
  const store=createCloudStore(env.db,env.images,r.id);await store.save('settings',{...DEFAULT_SETTINGS,title:'Custom title',showPrices:false},{revision:1});
  const publication=await createPublicationStore(env.db,env.images).publish(user,r.id,2);
  const exported=exportWorkspaceSql(env.sqlite);restored.exec('PRAGMA foreign_keys=ON;');restored.exec(exported);
  const recovered=createCloudStore(sqliteBinding(restored),env.images,r.id);assert.equal((await recovered.read()).catalogue.settings.title,'Custom title');assert.equal((await recovered.read()).catalogue.settings.showPrices,false);assert.equal((await recovered.history()).entries.length,1);
  assert.equal((await createPublicationStore(sqliteBinding(restored),env.images).published(r.slug)).catalogue.settings.showPrices,false);
  assert.equal(restored.prepare('SELECT name FROM restaurants WHERE id=?').get(r.id).name,"Cafe O'Clock");assert.equal(restored.prepare('SELECT COUNT(*) AS n FROM restaurants').get().n,2);
  assert.throws(()=>restored.exec(exported));assert.equal((await recovered.read()).revision,2);
 }finally{restored.close();env.sqlite.close();}
});
