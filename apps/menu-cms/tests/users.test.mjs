import {test} from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {readFileSync} from 'node:fs';
import {createUserStore,canRead,canWrite,requireSuper} from '../cloud/users.mjs';
function setup(){const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../cloud/migrations/0002-users.sql',import.meta.url),'utf8'));const prepare=sql=>({bind(...args){return {sql,args,async first(){return sqlite.prepare(sql).get(...args)},async all(){return {results:sqlite.prepare(sql).all(...args)}},async run(){const r=sqlite.prepare(sql).run(...args);return {meta:{changes:r.changes}}}}}});const db={prepare,async batch(statements){sqlite.exec('BEGIN');try{const result=statements.map(s=>({meta:{changes:sqlite.prepare(s.sql).run(...s.args).changes}}));sqlite.exec('COMMIT');return result}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,store:createUserStore(db)}}
test('registration starts pending, profile cannot grant access and repeat login preserves role',async()=>{
 const {sqlite,store}=setup();try{const identity={email:'new@example.com',iat:1000};let user=await store.identify(identity);assert.equal(user.status,'pending');assert.equal(user.role,'viewer');assert.equal(canRead(user),false);assert.equal(canWrite(user),false);assert.throws(()=>requireSuper(user),{status:403});
 user=await store.profile(user,{name:'New Person',role:'super_admin',status:'active'});assert.equal(user.role,'viewer');assert.equal(user.status,'pending');assert.equal((await store.identify(identity)).id,user.id);
 const owner=await store.identify({email:'artem.girda@gmail.com',iat:1001});assert.equal(owner.role,'super_admin');assert.equal(canWrite(owner),true);
 const approved=await store.update(owner,user.id,{role:'editor',status:'active',revision:user.revision},owner.email);assert.equal(canWrite(approved),true);assert.equal((await store.identify({...identity,iat:1002})).role,'editor');
 await assert.rejects(store.update(owner,user.id,{role:'viewer',status:'blocked',revision:user.revision},owner.email),{status:409});assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM cms_user_events').get().n,1);
 await assert.rejects(store.update(approved,owner.id,{role:'viewer',status:'blocked',revision:owner.revision},owner.email),{status:403});
 await assert.rejects(store.update(owner,owner.id,{role:'viewer',status:'blocked',revision:owner.revision},owner.email),{status:400});
 await assert.rejects(store.list(approved),{status:403});assert.equal((await store.list(owner)).users.length,2);
 const blocked=await store.update(owner,user.id,{role:'editor',status:'blocked',revision:approved.revision},owner.email);assert.equal(canRead(blocked),false);await assert.rejects(store.profile(blocked,{name:'Other'}),{status:403});
 }finally{sqlite.close()}
});
