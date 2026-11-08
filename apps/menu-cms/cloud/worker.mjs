import {publicMenuResponse} from '../public-menu.mjs';
import {authorize} from './auth.mjs';
import {isAllowedRequestSource} from './request-source.mjs';
import {createUserStore,canRead,requireSuper} from './users.mjs';
import {createCloudStore,CmsError} from './store.mjs';
import catalogue from '../../streetfood/src/data/catalogue.json';
import {catalogueApi,readJson as readBody} from '../catalogue-api.mjs';
import {createRestaurantStore} from '../restaurants.mjs';
import {createMenuView} from '../../streetfood/src/data/menu-view.mjs';
const images=[...new Set(catalogue.products.map(row=>row.image))];
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
function json(value,status=200){return Response.json(value,{status,headers});}
export default {async fetch(request,env){
  // Проверяем подпись и адрес даже при прямом обращении к workers.dev и к статическим файлам.
  let publicResponse;try{publicResponse=await publicMenuResponse(request,{db:env.DB,asset:path=>env.ASSETS.fetch(new Request(new URL(path,request.url)))});
  }catch(error){console.error(JSON.stringify({event:'public_menu_error',name:error.name}));return json({error:'Menu temporarily unavailable.'},503);}
  if(publicResponse)return publicResponse;
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
    const accountAssets=['/','/account.html','/cloud-shell.js','/account.css','/admin.css','/i18n.mjs'];
    if(!canRead(user)&&!accountAssets.includes(path))throw new CmsError(403,'Доступ к контенту ожидает одобрения администратора.');
    if(path==='/users.html'||path==='/users.js')requireSuper(user);
    const apiResponse=await catalogueApi(request,{db:env.DB,user,images});
    if(apiResponse){const response=new Response(apiResponse.body,apiResponse);for(const [key,value]of Object.entries(headers))response.headers.set(key,value);return response;}
    if(path.startsWith('/api/'))throw new CmsError(404,'Выбери ресторан в CMS.');
    if(!['GET','HEAD'].includes(request.method))throw new CmsError(405,'Метод не поддерживается.');
    let response=await env.ASSETS.fetch(request);
    if(/^\/preview\/(?:diner\/|bunhafen\/|pizzeria\/)?$/.test(path)&&response.ok){
      const restaurantId=url.searchParams.get('restaurant');
      await createRestaurantStore(env.DB).access(user,restaurantId);
      const store=createCloudStore(env.DB,images,restaurantId);
      const view=createMenuView((await store.read()).catalogue,'/preview/');
      const data=JSON.stringify(view).replaceAll('<','\\u003c');
      const html=(await response.text()).replace(/(<script\b[^>]*\bid="menu-data"[^>]*>)[\s\S]*?(<\/script>)/,(_,a,b)=>a+data+b).replace('<html','<html data-menu-preview').replace(/data-price-visibility="[^"]*"/,`data-price-visibility="${view.settings.showPrices?'visible':'hidden'}"`);
      response=new Response(html.replace(/href="(\/preview\/(?:bunhafen\/|pizzeria\/)?)"/g,(_,href)=>`href="${href}?restaurant=${restaurantId}"`),{headers:{'Content-Type':'text/html; charset=utf-8'}});
    }
    const result=new Response(request.method==='HEAD'?null:response.body,response);
    for(const [key,value]of Object.entries(headers))result.headers.set(key,value);
    return result;
  }catch(error){
    if(!(error instanceof CmsError))console.error(JSON.stringify({event:'cms_error',name:error.name}));
    return json({error:error instanceof CmsError?error.message:'Внутренняя ошибка CMS.'},error instanceof CmsError?error.status:500);
  }
}};
