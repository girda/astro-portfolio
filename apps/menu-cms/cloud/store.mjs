import {validateCatalogue,validateMenuSettings} from '../../streetfood/src/data/catalogue-contract.mjs';
export class CmsError extends Error {
  constructor(status,message){super(message);this.status=status;}
}
export function createCloudStore(db,images){
  async function read(){
    const row=await db.prepare('SELECT revision,data FROM catalogue_state WHERE id=1').first();
    if(!row)throw new CmsError(503,'База CMS ещё не перенесена.');
    return {revision:row.revision,catalogue:JSON.parse(row.data)};
  }
  async function history({before=Number.MAX_SAFE_INTEGER,limit=30}={}){
    if(!Number.isSafeInteger(before)||before<1||!Number.isSafeInteger(limit)||limit<1||limit>50)throw new CmsError(400,'Некорректные параметры истории.');
    const {results}=await db.prepare('SELECT data FROM catalogue_history WHERE revision < ? ORDER BY revision DESC LIMIT ?').bind(before,limit+1).all();
    const entries=results.slice(0,limit).map(row=>JSON.parse(row.data));
    return {entries,nextBefore:results.length>limit?entries.at(-1).revision:null};
  }
  async function save(kind,body,{id,revision,actor}={}){
    if(!body||typeof body!=='object'||Array.isArray(body))throw new CmsError(400,'Нужен объект данных.');
    if(!Number.isSafeInteger(revision))throw new CmsError(428,'Обнови данные перед сохранением.');
    if(kind==='products'&&!images.includes(body.image))throw new CmsError(400,'Выбери фото из библиотеки.');
    const state=await read();
    if(state.revision!==revision)throw new CmsError(409,'Данные изменились в другой вкладке. Обнови список.');
    const before=kind==='settings'?state.catalogue.settings:(id?state.catalogue[kind].find(row=>row.id===id):null);
    if(id&&!before)throw new CmsError(404,'Запись не найдена.');
    const fields=kind==='settings'?['title','subtitle','logo','menuMode','showPrices']:kind==='categories'?['name','symbol','sortOrder','active']:['name','categoryId','description','price','image','allergens','time','sortOrder','available','allergenIds','allergensVerified','variants'];
    const row={...(kind==='settings'?{}:{id:id||`${kind==='categories'?'category':'product'}-${crypto.randomUUID()}`}),...Object.fromEntries(fields.map(key=>[key,body[key]??before?.[key]]))};
    if(kind==='settings'){try{validateMenuSettings(row)}catch(error){throw new CmsError(400,error.message)}state.catalogue.settings=row;}else state.catalogue[kind]=id?state.catalogue[kind].map(item=>item.id===id?row:item):[...state.catalogue[kind],row];
    try{validateCatalogue(state.catalogue)}catch(error){throw new CmsError(400,error.message)}
    const event={revision:revision+1,kind,entityId:kind==='settings'?'menu':row.id,action:kind==='settings'||id?'update':'create',createdAt:new Date().toISOString(),before,after:row,...(actor?{actor:{id:actor.id,name:actor.name}}:{})};
    try{
      // Уникальная ревизия истории блокирует конкурирующее сохранение. D1 batch откатывает обе операции при конфликте.
      await db.batch([
        db.prepare('INSERT INTO catalogue_history(revision,data) VALUES (?,?)').bind(event.revision,JSON.stringify(event)),
        db.prepare('UPDATE catalogue_state SET revision=?,data=? WHERE id=1 AND revision=?').bind(event.revision,JSON.stringify(state.catalogue),revision),
      ]);
    }catch(error){
      if((await read()).revision!==revision)throw new CmsError(409,'Данные изменились в другой вкладке. Обнови список.');
      throw error;
    }
    return {catalogue:state.catalogue,revision:event.revision};
  }
  return {read,history,save};
}
