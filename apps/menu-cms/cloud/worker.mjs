import {authorize} from './auth.mjs';
import {isAllowedRequestSource} from './request-source.mjs';
import {createUserStore,canRead,canWrite,requireSuper} from './users.mjs';
import {createCloudStore,CmsError} from './store.mjs';
import catalogue from '../../streetfood/src/data/catalogue.json';
import {createMenuView} from '../../streetfood/src/data/menu-view.mjs';
const images=[...new Set(catalogue.products.map(row=>row.image))];
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
function json(value,status=200){return Response.json(value,{status,headers});}
async function readBody(request){
  if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))throw new CmsError(415,'Ожидается application/json.');
  const reader=request.body?.getReader();if(!reader)throw new CmsError(400,'Нужен объект данных.');
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();throw new CmsError(413,'Слишком большой запрос.')}chunks.push(value)}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  try{return JSON.parse(new TextDecoder().decode(bytes))}catch{throw new CmsError(400,'Некорректный JSON.')}
}
export default {async fetch(request,env){
  // Проверяем подпись и адрес даже при прямом обращении к workers.dev и к статическим файлам.
  const identity=await authorize(request,env);
  if(!identity)return json({error:'Подтверди email через Cloudflare Access.'},403);
  const url=new URL(request.url),path=url.pathname;
  try{
    if(!isAllowedRequestSource(request))throw new CmsError(403,'Запрос с другого сайта запрещён.');
    const accounts=createUserStore(env.DB);
    const user=await accounts.identify(identity);
    if(path==='/api/me'&&request.method==='GET')return json({user});
    if(path==='/api/me'&&request.method==='PUT')return json({user:await accounts.profile(user,await readBody(request))});
    if(path==='/api/users'&&request.method==='GET')return json(await accounts.list(user,url.searchParams.get('after')||''));
    const userMatch=path.match(/^\/api\/users\/([a-z0-9-]+)$/);
    if(userMatch&&request.method==='PATCH')return json({user:await accounts.update(user,userMatch[1],await readBody(request),env.ADMIN_EMAIL)});
    const accountAssets=['/','/account.html','/cloud-shell.js','/account.css','/admin.css'];
    if(!canRead(user)&&!accountAssets.includes(path))throw new CmsError(403,'Доступ к контенту ожидает одобрения администратора.');
    if(path==='/users.html'||path==='/users.js')requireSuper(user);
    const store=createCloudStore(env.DB,images);
    if(path==='/api/catalogue'&&request.method==='GET')return json(await store.read());
    if(path==='/api/images'&&request.method==='GET')return json(images);
    if(path==='/api/history'&&request.method==='GET')return json(await store.history({before:url.searchParams.has('before')?Number(url.searchParams.get('before')):undefined,limit:url.searchParams.has('limit')?Number(url.searchParams.get('limit')):30}));
    const match=path.match(/^\/api\/(categories|products)(?:\/([a-z0-9-]+))?$/);
    if(match){
      if(!canWrite(user))throw new CmsError(403,'Роль позволяет только просмотр.');
      if(!((request.method==='POST'&&!match[2])||(request.method==='PUT'&&match[2])))throw new CmsError(405,'Метод не поддерживается.');
      return json(await store.save(match[1],await readBody(request),{actor:user,id:match[2],revision:request.headers.has('if-match')?Number(request.headers.get('if-match')):undefined}),request.method==='POST'?201:200);
    }
    if(!['GET','HEAD'].includes(request.method))throw new CmsError(405,'Метод не поддерживается.');
    let response=await env.ASSETS.fetch(request);
    if(/^\/preview\/(?:diner\/|pizzeria\/)?$/.test(path)&&response.ok){
      const data=JSON.stringify(createMenuView((await store.read()).catalogue,'/preview/')).replaceAll('<','\\u003c');
      const html=(await response.text()).replace(/(<script\b[^>]*\bid="menu-data"[^>]*>)[\s\S]*?(<\/script>)/,(_,a,b)=>a+data+b).replace('<html','<html data-menu-preview');
      response=new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8'}});
    }
    const result=new Response(request.method==='HEAD'?null:response.body,response);
    for(const [key,value]of Object.entries(headers))result.headers.set(key,value);
    return result;
  }catch(error){
    if(!(error instanceof CmsError))console.error(JSON.stringify({event:'cms_error',name:error.name}));
    return json({error:error instanceof CmsError?error.message:'Внутренняя ошибка CMS.'},error instanceof CmsError?error.status:500);
  }
}};
