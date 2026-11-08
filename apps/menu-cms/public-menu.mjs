import {createPublicationStore} from './publications.mjs';
import {createMenuView} from '../streetfood/src/data/menu-view.mjs';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",'Referrer-Policy':'no-referrer'};
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function publicMenuResponse(request,{db,asset}){
 const url=new URL(request.url),match=url.pathname.match(/^\/m\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/),resource=url.pathname.match(/^\/menu-assets\/((?:_astro\/[a-zA-Z0-9_.-]+\.(?:css|js|woff2|ttf|webp|svg))|(?:assets\/(?:menu\/[a-z0-9-]+\.webp|[a-z0-9-]+\.svg)))$/);
 if(!match&&!resource)return null;
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers});
 let response;
 if(resource){
  response=await asset('/preview/'+resource[1]);
  if(response.ok&&resource[1].endsWith('.css'))response=new Response((await response.text()).replaceAll('/astro-portfolio/demos/streetfood/','/menu-assets/').replaceAll('/preview/','/menu-assets/'),{headers:{'Content-Type':'text/css; charset=utf-8'}});
 }else{
  const publication=await createPublicationStore(db,[]).published(match[1]);
  if(!publication)return new Response('Dieses Menü ist noch nicht veröffentlicht.',{status:404,headers});
  if(!url.pathname.endsWith('/'))return new Response(null,{status:302,headers:{...headers,Location:url.pathname+'/'}});
  const theme=publication.catalogue.settings?.templateKey||'streetfood';
  const path=theme==='diner'?'bunhafen/':theme==='pizzeria'?'pizzeria/':'';
  const template=await asset('/preview/'+path);if(!template.ok)return new Response('Menü momentan nicht verfügbar.',{status:503,headers});
  const view=createMenuView(publication.catalogue,'/menu-assets/'),data=JSON.stringify(view).replaceAll('<','\\u003c');
  let html=(await template.text()).replaceAll('/astro-portfolio/demos/streetfood/','/menu-assets/').replaceAll('/preview/','/menu-assets/');
  html=html.replace(/(<script\b[^>]*\bid="menu-data"[^>]*>)[\s\S]*?(<\/script>)/,(_,a,b)=>a+data+b).replace('<html','<html data-menu-preview data-menu-runtime');
  html=html.replace(/data-price-visibility="[^"]*"/,`data-price-visibility="${view.settings.showPrices?'visible':'hidden'}"`).replace(/<title>[\s\S]*?<\/title>/,()=>`<title>${escape(publication.profile.name)} — Speisekarte</title>`).replace(/<link rel="canonical"[^>]*>/,()=>`<link rel="canonical" href="${escape(url.origin+url.pathname)}">`);
  html=html.replace(/href="\/menu-assets\/(?:bunhafen\/|pizzeria\/)?"/g,()=>`href="${escape(url.pathname)}"`);
  // До запуска общего renderer не показываем блюда из build-time демокаталога.
  html=html.replace(/class="dish-grid"/, 'class="dish-grid" hidden');
  response=new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8'}});
 }
 const result=new Response(request.method==='HEAD'?null:response.body,response);for(const [key,value]of Object.entries(headers))result.headers.set(key,value);return result;
}
