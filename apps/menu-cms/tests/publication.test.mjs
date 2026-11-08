import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_SETTINGS} from '../../streetfood/src/data/menu-options.mjs';
import {startCms} from '../server.mjs';
import {localWorkspaces} from '../local-workspaces.mjs';
import {createRestaurantStore} from '../restaurants.mjs';
import {createPublicationStore} from '../publications.mjs';
import {createCloudStore} from '../cloud/store.mjs';
import {createUserStore} from '../cloud/users.mjs';
const newUser=async(db,email)=>{const users=createUserStore(db);return users.profile(await users.identify({email,iat:1000}),{name:'Cafe Owner'});};

test('published snapshot is stable while draft changes; theme switch keeps address; rollback preserves draft',async()=>{
 const env=localWorkspaces(':memory:');try{
  const restaurants=createRestaurantStore(env.db),owner=await newUser(env.db,'owner@example.com');const r=await restaurants.create(owner,{name:'Own Cafe',slug:'own-cafe'}),store=createCloudStore(env.db,env.images,r.id),pub=createPublicationStore(env.db,env.images);
  assert.equal(await pub.published(r.slug),null);
  await assert.rejects(pub.publish(owner,r.id,undefined),{status:428});await assert.rejects(pub.publish(owner,r.id,99),{status:409});
  const initial=await pub.publish(owner,r.id,1);const original=await store.read();
  await store.save('settings',{...original.catalogue.settings,templateKey:'pizzeria',title:'UNPUBLISHED'},{revision:1});
  assert.equal((await pub.published(r.slug)).catalogue.settings.title,'Own Cafe');
  const next=await pub.publish(owner,r.id,2);assert.equal(next.path,initial.path);assert.equal((await pub.published(r.slug)).catalogue.settings.templateKey,'pizzeria');
  await pub.restore(owner,r.id,initial.currentVersion);assert.equal((await pub.published(r.slug)).catalogue.settings.title,'Own Cafe');assert.equal((await store.read()).catalogue.settings.title,'UNPUBLISHED');

 }finally{env.close();}
});

test('publication endpoints enforce tenant and viewer/blocked restrictions, including foreign rollback IDs',async()=>{
 const env=localWorkspaces(':memory:');try{
  const a=await newUser(env.db,'a@example.com'),b=await newUser(env.db,'b@example.com'),restaurants=createRestaurantStore(env.db),pub=createPublicationStore(env.db,env.images);
  const ra=await restaurants.create(a,{name:'Cafe A',slug:'cafe-a'}),rb=await restaurants.create(b,{name:'Cafe B',slug:'cafe-b'});
  const pa=await pub.publish(a,ra.id,1);await assert.rejects(pub.status(b,ra.id),{status:404});await assert.rejects(pub.publish(b,ra.id,1),{status:404});await assert.rejects(pub.restore(b,rb.id,pa.currentVersion),{status:404});
  await env.db.prepare("INSERT INTO restaurant_memberships VALUES (?,?,'viewer')").bind(ra.id,b.id).run();
  await assert.rejects(pub.publish(b,ra.id,1),{status:403});await assert.rejects(pub.restore(b,ra.id,pa.currentVersion),{status:403});await assert.rejects(pub.status({...a,status:'blocked'},ra.id),{status:403});
 }finally{env.close();}
});

test('public local menu requires explicit publication, hides unpublished changes and private assets',async()=>{
 const app=await startCms({port:0,path:':memory:'});try{
  const path='/api/restaurants/internal-demo/';
  assert.equal((await fetch(app.url+'/m/internal-demo/')).status,404);
  const initial=await (await fetch(app.url+path+'catalogue')).json();
  let response=await fetch(app.url+path+'publish',{method:'POST',headers:{'If-Match':String(initial.revision)}});assert.equal(response.status,200);
  const publication=await response.json();assert.equal(publication.path,'/m/internal-demo/');
  const draft={...DEFAULT_SETTINGS,...initial.catalogue.settings,title:'Private new draft </script><script>bad()</script>',templateKey:'pizzeria'};
  response=await fetch(app.url+path+'settings',{method:'PUT',headers:{'Content-Type':'application/json','If-Match':'1'},body:JSON.stringify(draft)});assert.equal(response.status,200);
  const html=await (await fetch(app.url+publication.path)).text();assert.ok(!html.includes('Private new draft'));assert.match(html,/data-menu-runtime/);assert.match(html,/class="dish-grid" hidden/);
  const data=JSON.parse(html.match(/<script[^>]*id="menu-data"[^>]*>([\s\S]*?)<\/script>/)[1]);assert.equal(data.settings.title,initial.catalogue.settings?.title||DEFAULT_SETTINGS.title);
  const resources=[...html.matchAll(/(?:src|href)="(\/menu-assets\/[^"?]+)"/g)].map(m=>m[1]);assert.ok(resources.length);
  for(const resource of new Set(resources))assert.equal((await fetch(app.url+resource)).status,200,resource);
  assert.equal((await fetch(app.url+'/menu-assets/index.html')).status,404);assert.equal((await fetch(app.url+'/m/missing/')).status,404);
  assert.equal((await fetch(app.url+'/m/internal-demo/',{method:'POST'})).status,405);
  await fetch(app.url+path+'publish',{method:'POST',headers:{'If-Match':'2'}});
  const next=await (await fetch(app.url+publication.path)).text();assert.ok(next.includes('data-appearance="pizzeria"'));assert.ok(!next.includes('</script><script>bad()'));
  assert.equal(JSON.parse(next.match(/<script[^>]*id="menu-data"[^>]*>([\s\S]*?)<\/script>/)[1]).settings.title,draft.title);
 }finally{await app.close();}
});

test('a concurrent draft update cannot create a partial or stale publication',async()=>{
 const env=localWorkspaces(':memory:');try{
  const store=createCloudStore(env.db,env.images,'internal-demo');let intercepted=false;
  const delayed={...env.db,async batch(statements){if(!intercepted){intercepted=true;await store.save('settings',{...DEFAULT_SETTINGS,title:'Concurrent edit'},{revision:1});}return env.db.batch(statements);}};
  const pub=createPublicationStore(delayed,env.images);await assert.rejects(pub.publish(env.user,'internal-demo',1),{status:409});
  assert.equal(await pub.published('internal-demo'),null);assert.equal((await pub.status(env.user,'internal-demo')).versions.length,0);
 }finally{env.close();}
});
