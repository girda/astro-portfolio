import {readFileSync} from 'node:fs';
import {validateCatalogue} from '../../streetfood/src/data/catalogue-contract.mjs';
const quote=value=>value===null?'NULL':typeof value==='number'?String(value):"'"+String(value).replaceAll("'","''")+"'";
export function exportWorkspaceSql(db){
 if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='restaurants'").get())throw new Error('Сначала запусти локальную CMS для переноса ресторанов.');
 for(const row of db.prepare('SELECT data FROM restaurant_catalogues').all())validateCatalogue(JSON.parse(row.data));
 let sql=readFileSync(new URL('schema.sql',import.meta.url),'utf8')+'\n'+readFileSync(new URL('migrations/0002-users.sql',import.meta.url),'utf8')+'\n'+readFileSync(new URL('migrations/0003-restaurants.sql',import.meta.url),'utf8')+'\n'+readFileSync(new URL('migrations/0004-publication.sql',import.meta.url),'utf8')+'\n';
 // Только первичный импорт в новую БД. CREATE TABLE в 0003 остановит повторный импорт до записей клиентов.
 const columns={cms_users:['id','email','name','role','status','created_at','last_login_at','revision'],cms_user_events:['id','actor_id','user_id','created_at','data'],restaurants:['id','slug','name','template_key','locale','currency','created_at'],restaurant_memberships:['restaurant_id','user_id','role'],restaurant_catalogues:['restaurant_id','revision','data'],restaurant_history:['restaurant_id','revision','data'],menu_versions:['restaurant_id','id','draft_revision','data','profile','actor_id','created_at'],menu_publications:['restaurant_id','version_id']};
 for(const [table,keys]of Object.entries(columns).filter(([table])=>db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table)))for(const row of db.prepare('SELECT * FROM '+table).all()){
  const owner=table==='cms_users'&&row.id==='owner-artem-hirda';
  sql+=`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(key=>quote(row[key])).join(',')})`+(owner?` ON CONFLICT(id) DO UPDATE SET ${keys.filter(key=>key!=='id').map(key=>`${key}=excluded.${key}`).join(',')}`:'')+';\n';
 }
 return sql;
}
