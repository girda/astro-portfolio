import {CmsError} from './errors.mjs';
import {restaurantInput,emptyCatalogue,requireActive} from './restaurant-contract.mjs';
export function createRestaurantStore(db){
 async function list(user){
  requireActive(user);
  const query=user.role==='super_admin'?db.prepare("SELECT r.*, 'platform_admin' AS membership_role FROM restaurants r ORDER BY r.created_at,r.id"):db.prepare('SELECT r.*,m.role AS membership_role FROM restaurants r JOIN restaurant_memberships m ON m.restaurant_id=r.id WHERE m.user_id=? ORDER BY r.created_at,r.id').bind(user.id);
  return (await query.all()).results;
 }
 async function access(user,id,write=false){
  requireActive(user);
  if(typeof id!=='string'||! /^[a-z0-9-]{1,80}$/.test(id))throw new CmsError(400,'Выбери ресторан.');
  const restaurant=user.role==='super_admin'?await db.prepare("SELECT r.*, 'platform_admin' AS membership_role FROM restaurants r WHERE r.id=?").bind(id).first():await db.prepare('SELECT r.*,m.role AS membership_role FROM restaurants r JOIN restaurant_memberships m ON m.restaurant_id=r.id WHERE r.id=? AND m.user_id=?').bind(id,user.id).first();
  // Одинаковый ответ для чужого и несуществующего ID: не раскрываем список заведений.
  if(!restaurant)throw new CmsError(404,'Ресторан не найден или недоступен.');
  if(write&&!['owner','editor','platform_admin'].includes(restaurant.membership_role))throw new CmsError(403,'Роль позволяет только просмотр.');
  return restaurant;
 }
 async function create(user,body){
  requireActive(user);
  if(!user.name||user.name.trim().length<2)throw new CmsError(400,'Сначала укажи имя в профиле.');
  const {name,slug}=restaurantInput(body),id=crypto.randomUUID(),createdAt=new Date().toISOString();
  try{await db.batch([
   db.prepare('INSERT INTO restaurants(id,slug,name,created_at) VALUES (?,?,?,?)').bind(id,slug,name,createdAt),
   db.prepare("INSERT INTO restaurant_memberships VALUES (?,?,'owner')").bind(id,user.id),
   db.prepare('INSERT INTO restaurant_catalogues VALUES (?,1,?)').bind(id,JSON.stringify(emptyCatalogue(name)))
  ]);}catch(error){if(await db.prepare('SELECT id FROM restaurants WHERE slug=?').bind(slug).first())throw new CmsError(409,'Этот адрес уже занят. Выбери другой.');throw error;}
  return access(user,id);
 }
 return {list,access,create};
}
