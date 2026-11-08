import {historyQuery,historySql} from '../history-query.mjs';
import {validateCatalogue,validateMenuSettings} from '../../streetfood/src/data/catalogue-contract.mjs';
import {CmsError} from '../errors.mjs';
export {CmsError} from '../errors.mjs';
export function createCloudStore(db,images,restaurantId){
  if(typeof restaurantId!=='string'||!restaurantId)throw new Error('Restaurant scope is required');
  async function read(){
    const row=await db.prepare('SELECT revision,data FROM restaurant_catalogues WHERE restaurant_id=?').bind(restaurantId).first();
    if(!row)throw new CmsError(503,'База CMS ещё не перенесена.');
    return {revision:row.revision,catalogue:JSON.parse(row.data)};
  }
  async function history({before=Number.MAX_SAFE_INTEGER,limit=30}={}){
    if(!Number.isSafeInteger(before)||before<1||!Number.isSafeInteger(limit)||limit<1||limit>50)throw new CmsError(400,'Некорректные параметры истории.');
    const {results}=await db.prepare('SELECT data FROM restaurant_history WHERE restaurant_id=? AND revision < ? ORDER BY revision DESC LIMIT ?').bind(restaurantId,before,limit+1).all();
    const entries=results.slice(0,limit).map(row=>JSON.parse(row.data));
    return {entries,nextBefore:results.length>limit?entries.at(-1).revision:null};
  }
  async function queryHistory(options={}){
    let p;try{p=historyQuery(options)}catch(error){throw new CmsError(400,error.message)}
    p.anchor=Math.min(p.anchor,(await read()).revision);
    const sql=historySql(p,true),count=await db.prepare('SELECT COUNT(*) AS total FROM restaurant_history WHERE restaurant_id=? AND '+sql.where).bind(restaurantId,...sql.params).first();
    const total=count.total,pages=Math.max(1,Math.ceil(total/p.pageSize)),page=Math.min(p.page,pages);
    const {results}=await db.prepare('SELECT data FROM restaurant_history WHERE restaurant_id=? AND '+sql.where+' ORDER BY '+sql.order+' LIMIT ? OFFSET ?').bind(restaurantId,...sql.params,p.pageSize,(page-1)*p.pageSize).all();
    return {entries:results.map(row=>JSON.parse(row.data)),total,page,pages,anchor:p.anchor};
  }
  async function save(kind,body,{id,revision,actor}={}){
    if(!body||typeof body!=='object'||Array.isArray(body))throw new CmsError(400,'Нужен объект данных.');
    if(!Number.isSafeInteger(revision))throw new CmsError(428,'Обнови данные перед сохранением.');
    if(kind==='products'&&!images.includes(body.image))throw new CmsError(400,'Выбери фото из библиотеки.');
    const state=await read();
    if(state.revision!==revision)throw new CmsError(409,'Данные изменились в другой вкладке. Обнови список.');
    const before=kind==='settings'?state.catalogue.settings:(id?state.catalogue[kind].find(row=>row.id===id):null);
    if(id&&!before)throw new CmsError(404,'Запись не найдена.');
    const fields=kind==='settings'?['title','subtitle','logo','menuMode','showPrices','templateKey']:kind==='categories'?['name','symbol','sortOrder','active']:['name','categoryId','description','price','image','allergens','time','sortOrder','available','allergenIds','allergensVerified','variants'];
    const row={...(kind==='settings'?{}:{id:id||`${kind==='categories'?'category':'product'}-${crypto.randomUUID()}`}),...Object.fromEntries(fields.map(key=>[key,body[key]??before?.[key]]))};
    if(kind==='settings'){try{validateMenuSettings(row)}catch(error){throw new CmsError(400,error.message)}state.catalogue.settings=row;}else state.catalogue[kind]=id?state.catalogue[kind].map(item=>item.id===id?row:item):[...state.catalogue[kind],row];
    try{validateCatalogue(state.catalogue)}catch(error){throw new CmsError(400,error.message)}
    const event={revision:revision+1,kind,entityId:kind==='settings'?'menu':row.id,action:kind==='settings'||id?'update':'create',createdAt:new Date().toISOString(),before,after:row,...(actor?{actor:{id:actor.id,name:actor.name}}:{})};
    try{
      // Уникальная ревизия истории блокирует конкурирующее сохранение. D1 batch откатывает обе операции при конфликте.
      await db.batch([
        db.prepare('INSERT INTO restaurant_history(restaurant_id,revision,data) VALUES (?,?,?)').bind(restaurantId,event.revision,JSON.stringify(event)),
        db.prepare('UPDATE restaurant_catalogues SET revision=?,data=? WHERE restaurant_id=? AND revision=?').bind(event.revision,JSON.stringify(state.catalogue),restaurantId,revision),
      ]);
    }catch(error){
      if((await read()).revision!==revision)throw new CmsError(409,'Данные изменились в другой вкладке. Обнови список.');
      throw error;
    }
    return {catalogue:state.catalogue,revision:event.revision};
  }
  return {read,history,queryHistory,save};
}
