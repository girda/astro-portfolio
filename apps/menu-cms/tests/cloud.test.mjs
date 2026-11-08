import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createCloudStore} from '../cloud/store.mjs';
import {authorize} from '../cloud/auth.mjs';
const seed=JSON.parse(readFileSync(new URL('../../streetfood/src/data/catalogue.json',import.meta.url)));
test('cloud store atomically rejects concurrent revisions and retains history',async()=>{
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../cloud/schema.sql',import.meta.url),'utf8'));
 sqlite.prepare('INSERT INTO catalogue_state VALUES (1,1,?)').run(JSON.stringify(seed));
 const prepare=sql=>({bind(...args){return {sql,args,async first(){return sqlite.prepare(sql).get(...args)},async all(){return {results:sqlite.prepare(sql).all(...args)}}}},async first(){return sqlite.prepare(sql).get()}});
 const db={prepare,async batch(statements){sqlite.exec('BEGIN');try{for(const s of statements)sqlite.prepare(s.sql).run(...s.args);sqlite.exec('COMMIT')}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
 const store=createCloudStore(db,seed.products.map(p=>p.image));const original=seed.products[0];
 const results=await Promise.allSettled([store.save('products',{...original,price:1111},{id:original.id,revision:1}),store.save('products',{...original,price:2222},{id:original.id,revision:1})]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
 assert.equal((await store.read()).revision,2);const events=(await store.history()).entries;assert.equal(events.length,1);assert.equal(events[0].before.price,original.price);
 const queried=await store.queryHistory({q:original.name,kind:'products',field:'price',pageSize:10});assert.equal(queried.total,1);assert.equal(queried.entries[0].revision,2);
 await assert.rejects(store.save('products',{...original,image:'evil.webp'},{id:original.id,revision:2}),{status:400});
 assert.equal((await store.read()).revision,2);sqlite.close();
});
test('cloud authorization fails closed without configuration or signed identity',async()=>{
 assert.equal(await authorize(new Request('https://cms.example/'),{}),false);
 assert.equal(await authorize(new Request('https://cms.example/',{headers:{'Cf-Access-Authenticated-User-Email':'artem.girda@gmail.com'}}),{ACCESS_TEAM_DOMAIN:'example.cloudflareaccess.com',ACCESS_AUD:'test',ADMIN_EMAIL:'artem.girda@gmail.com'}),false);
});

test('Access JWT requires trusted signature, issuer, audience and unexpired claims',async()=>{
 const {generateKeyPair,SignJWT}=await import('jose');const {verifyIdentity}=await import('../cloud/auth.mjs');
 const key=await generateKeyPair('RS256');const other=await generateKeyPair('RS256');
 const issuer='https://test.cloudflareaccess.com';
 const sign=(audience='cms',expiration='5m')=>new SignJWT({email:'test@example.com'}).setProtectedHeader({alg:'RS256'}).setSubject('verified-user').setIssuedAt().setIssuer(issuer).setAudience(audience).setExpirationTime(expiration).sign(key.privateKey);
 const token=await sign();assert.equal((await verifyIdentity(token,key.publicKey,issuer,'cms')).email,'test@example.com');
 assert.equal(await verifyIdentity(token,other.publicKey,issuer,'cms'),false);
 assert.equal(await verifyIdentity(token,key.publicKey,'https://wrong.cloudflareaccess.com','cms'),false);
 assert.equal(await verifyIdentity(await sign('other'),key.publicKey,issuer,'cms'),false);
 assert.equal(await verifyIdentity(await sign('cms',0),key.publicKey,issuer,'cms'),false);
});
