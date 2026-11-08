import {CmsError} from './errors.mjs';
import {createRestaurantStore} from './restaurants.mjs';
import {createCloudStore} from './cloud/store.mjs';
export const menuPath=slug=>'/m/'+slug+'/';
export function createPublicationStore(db,images){
 const restaurants=createRestaurantStore(db);
 async function status(user,id){
  const restaurant=await restaurants.access(user,id);
  const versions=(await db.prepare('SELECT id,draft_revision,created_at FROM menu_versions WHERE restaurant_id=? ORDER BY created_at DESC,id DESC LIMIT 50').bind(id).all()).results;
  const current=await db.prepare('SELECT version_id FROM menu_publications WHERE restaurant_id=?').bind(id).first();
  return {path:menuPath(restaurant.slug),currentVersion:current?.version_id||null,versions};
 }
 async function publish(user,id,revision){
  const restaurant=await restaurants.access(user,id,true),store=createCloudStore(db,images,id),draft=await store.read();
  if(!Number.isSafeInteger(revision))throw new CmsError(428,'Обнови данные перед сохранением.');
  if(draft.revision!==revision)throw new CmsError(409,'Данные изменились в другой вкладке. Обнови список.');
  const version=crypto.randomUUID(),created=new Date().toISOString();
  // Проверка ревизии выполняется внутри batch: изменение draft не может незаметно попасть в публикацию.
  await db.batch([
   db.prepare('INSERT INTO menu_versions(restaurant_id,id,draft_revision,data,profile,actor_id,created_at) SELECT restaurant_id,?,revision,data,?,?,? FROM restaurant_catalogues WHERE restaurant_id=? AND revision=?').bind(version,JSON.stringify({name:restaurant.name}),user.id,created,id,revision),
   db.prepare('INSERT INTO menu_publications(restaurant_id,version_id) VALUES (?,?) ON CONFLICT(restaurant_id) DO UPDATE SET version_id=excluded.version_id').bind(id,version)
  ]).catch(async error=>{if((await store.read()).revision!==revision)throw new CmsError(409,'Данные изменились в другой вкладке. Обнови список.');throw error;});
  return status(user,id);
 }
 async function restore(user,id,version){
  await restaurants.access(user,id,true);
  if(typeof version!=='string'||!await db.prepare('SELECT id FROM menu_versions WHERE restaurant_id=? AND id=?').bind(id,version).first())throw new CmsError(404,'Версия не найдена.');
  await db.prepare('INSERT INTO menu_publications VALUES (?,?) ON CONFLICT(restaurant_id) DO UPDATE SET version_id=excluded.version_id').bind(id,version).run();
  return status(user,id);
 }
 async function published(slug){
  const row=await db.prepare('SELECT v.data,v.profile,v.id FROM restaurants r JOIN menu_publications p ON p.restaurant_id=r.id JOIN menu_versions v ON v.restaurant_id=p.restaurant_id AND v.id=p.version_id WHERE r.slug=?').bind(slug).first();
  return row?{catalogue:JSON.parse(row.data),profile:JSON.parse(row.profile),version:row.id}:null;
 }
 return {status,publish,restore,published};
}
