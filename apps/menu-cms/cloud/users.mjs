import {CmsError} from './store.mjs';
const publicUser=row=>({id:row.id,email:row.email,name:row.name,role:row.role,status:row.status,createdAt:row.created_at,lastLoginAt:row.last_login_at,revision:row.revision});
export function canRead(user){return user?.status==='active'&&['viewer','editor','super_admin'].includes(user.role)}
export function canWrite(user){return user?.status==='active'&&['editor','super_admin'].includes(user.role)}
export function requireSuper(user){if(user?.status!=='active'||user.role!=='super_admin')throw new CmsError(403,'Нужны права супер-администратора.')}
export function createUserStore(db){
 async function identify(identity){
  const email=identity.email.toLowerCase();
  const login=new Date(identity.iat*1000).toISOString();
  await db.prepare('INSERT INTO cms_users (id,email,created_at,last_login_at) VALUES (?,?,?,?) ON CONFLICT(email) DO NOTHING').bind(crypto.randomUUID(),email,new Date().toISOString(),login).run();
  await db.prepare('UPDATE cms_users SET last_login_at=? WHERE email=? AND (last_login_at IS NULL OR last_login_at < ?)').bind(login,email,login).run();
  return publicUser(await db.prepare('SELECT * FROM cms_users WHERE email=?').bind(email).first());
 }
 async function profile(user,body){
  if(user.status==='blocked')throw new CmsError(403,'Учётная запись заблокирована.');
  if(typeof body?.name!=='string'||body.name.trim().length<2||body.name.trim().length>100||/[\x00-\x1f]/.test(body.name))throw new CmsError(400,'Укажи имя от 2 до 100 символов.');
  await db.prepare('UPDATE cms_users SET name=?,revision=revision+1 WHERE id=?').bind(body.name.trim(),user.id).run();
  return publicUser(await db.prepare('SELECT * FROM cms_users WHERE id=?').bind(user.id).first());
 }
 async function list(actor,after=''){
  requireSuper(actor);if(after.length>100)throw new CmsError(400,'Некорректный курсор.');
  const {results}=await db.prepare('SELECT * FROM cms_users WHERE id > ? ORDER BY id LIMIT 51').bind(after).all();
  const users=results.slice(0,50).map(publicUser);return {users,nextAfter:results.length>50?users.at(-1).id:null};
 }
 async function update(actor,id,body,ownerEmail){
  requireSuper(actor);
  const current=await db.prepare('SELECT * FROM cms_users WHERE id=?').bind(id).first();
  if(!current)throw new CmsError(404,'Пользователь не найден.');
  if(id===actor.id||current.email.toLowerCase()===ownerEmail?.toLowerCase())throw new CmsError(400,'Нельзя изменить доступ владельца или собственную роль.');
  if(!['viewer','editor','super_admin'].includes(body?.role)||!['pending','active','blocked'].includes(body?.status)||!Number.isSafeInteger(body?.revision))throw new CmsError(400,'Некорректная роль, статус или версия.');
  if(body.status==='active'&&current.name.trim().length<2)throw new CmsError(400,'Пользователь должен сначала заполнить имя.');
  const before=publicUser(current);const after={...before,role:body.role,status:body.status,revision:body.revision+1};
  // changes() относится к предыдущему UPDATE в той же транзакции D1 batch.
  const event={before,after};
  const result=await db.batch([
   db.prepare('UPDATE cms_users SET role=?,status=?,revision=revision+1 WHERE id=? AND revision=?').bind(body.role,body.status,id,body.revision),
   db.prepare('INSERT INTO cms_user_events(id,actor_id,user_id,created_at,data) SELECT ?,?,?,?,? WHERE changes()=1').bind(crypto.randomUUID(),actor.id,id,new Date().toISOString(),JSON.stringify(event)),
  ]);
  if(result[0].meta.changes!==1)throw new CmsError(409,'Пользователь изменён в другой вкладке. Обнови список.');
  return after;
 }
 return {identify,profile,list,update};
}
