import {DatabaseSync} from 'node:sqlite';
import {readFileSync,chmodSync} from 'node:fs';
import {createMenuStore,menuImages} from './store.mjs';
import {sqliteBinding} from './sqlite-binding.mjs';
import {LEGACY_RESTAURANT_ID} from './restaurant-contract.mjs';
export function localWorkspaces(path){
 // Старый store используется только для первоначального переноса. Снимок остаётся нетронутым.
 const legacy=createMenuStore(path),initial=legacy.read();
 // :memory: нельзя открыть вторым соединением; переносим через снимок и события.
 const events=[];let before;do{const page=legacy.history({before,limit:50});events.push(...page.entries);before=page.nextBefore;}while(before);
 legacy.close();
 const sqlite=new DatabaseSync(path);sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 try{
  if(!sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='restaurants'").get()){
   if(path!==':memory:'){const backup=path+'.pre-restaurants-'+Date.now()+'.sqlite';sqlite.prepare('VACUUM INTO ?').run(backup);chmodSync(backup,0o600);}
   sqlite.exec('BEGIN IMMEDIATE');try{
    sqlite.exec(readFileSync(new URL('./cloud/schema.sql',import.meta.url),'utf8'));
    sqlite.exec(readFileSync(new URL('./cloud/migrations/0002-users.sql',import.meta.url),'utf8'));
    sqlite.prepare('INSERT INTO catalogue_state VALUES (1,?,?)').run(initial.revision,JSON.stringify(initial.catalogue));
    for(const event of events)sqlite.prepare('INSERT INTO catalogue_history VALUES (?,?)').run(event.revision,JSON.stringify(event));
    sqlite.exec(readFileSync(new URL('./cloud/migrations/0003-restaurants.sql',import.meta.url),'utf8'));
    sqlite.exec('COMMIT');
   }catch(error){sqlite.exec('ROLLBACK');throw error;}
  }
  const user=sqlite.prepare("SELECT * FROM cms_users WHERE id='owner-artem-hirda'").get();
  return {db:sqliteBinding(sqlite),user,images:menuImages,restaurantId:LEGACY_RESTAURANT_ID,close:()=>sqlite.close()};
 }catch(error){sqlite.close();throw error;}
}
