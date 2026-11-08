import {createRestaurantStore} from './restaurants.mjs';
import {createCloudStore,CmsError} from './cloud/store.mjs';
export async function catalogueApi(request,{db,user,images}){
 const url=new URL(request.url),path=url.pathname,restaurants=createRestaurantStore(db);
 if(path==='/api/restaurants'){
  if(request.method==='GET')return Response.json({restaurants:await restaurants.list(user)});
  if(request.method==='POST')return Response.json({restaurant:await restaurants.create(user,await readJson(request))},{status:201});
  throw new CmsError(405,'Метод не поддерживается.');
 }
 const match=path.match(/^\/api\/restaurants\/([a-z0-9-]+)\/(catalogue|settings|images|history(?:\/query)?|categories|products)(?:\/([a-z0-9-]+))?$/);
 if(!match)return null;
 const [,restaurantId,resource,id]=match;
 const writing=!['GET','HEAD'].includes(request.method);
 await restaurants.access(user,restaurantId,writing);
 const store=createCloudStore(db,images,restaurantId);
 if(resource==='catalogue'&&request.method==='GET'&&!id)return Response.json(await store.read());
 if(resource==='images'&&request.method==='GET'&&!id)return Response.json(images);
 if(resource==='history/query'&&request.method==='GET'&&!id)return Response.json(await store.queryHistory(Object.fromEntries(url.searchParams)));
 if(resource==='history'&&request.method==='GET'&&!id)return Response.json(await store.history({before:url.searchParams.has('before')?Number(url.searchParams.get('before')):undefined,limit:url.searchParams.has('limit')?Number(url.searchParams.get('limit')):30}));
 if(resource==='settings'&&request.method==='PUT'&&!id||['categories','products'].includes(resource)&&(request.method==='POST'&&!id||request.method==='PUT'&&id)){
  const data=await store.save(resource,await readJson(request),{id,actor:user,revision:request.headers.get('if-match')?.trim()?Number(request.headers.get('if-match')):undefined});
  return Response.json(data,{status:request.method==='POST'?201:200});
 }
 throw new CmsError(405,'Метод не поддерживается.');
}
export async function readJson(request){
 if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))throw new CmsError(415,'Ожидается application/json.');
 const reader=request.body?.getReader();if(!reader)throw new CmsError(400,'Нужен объект данных.');
 const chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();throw new CmsError(413,'Слишком большой запрос.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const value of chunks){bytes.set(value,offset);offset+=value.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new CmsError(400,'Некорректный JSON.');}
}
