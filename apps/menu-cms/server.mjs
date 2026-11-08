import {createServer} from 'node:http';
import {readFileSync,mkdirSync,chmodSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {CmsError} from './errors.mjs';
import {publicMenuResponse} from './public-menu.mjs';
import {localWorkspaces} from './local-workspaces.mjs';
import {catalogueApi} from './catalogue-api.mjs';
import {createCloudStore} from './cloud/store.mjs';
import {createRestaurantStore} from './restaurants.mjs';
import {createMenuView} from '../streetfood/src/data/menu-view.mjs';
const publicDir=new URL('./public/',import.meta.url);
const buildDir=new URL('../streetfood/dist/',import.meta.url);
const imagesDir=new URL('../streetfood/public/assets/menu/',import.meta.url);
const MAX_BODY=65536;
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));}
export async function startCms({port=8790,path}={}) {
  if(!path){const directory=new URL('./.local-data/',import.meta.url);mkdirSync(directory,{recursive:true,mode:0o700});path=fileURLToPath(new URL('menu.sqlite',directory));}
  const workspace=localWorkspaces(path);
  const store=createCloudStore(workspace.db,workspace.images,workspace.restaurantId);
  if(path!==':memory:')chmodSync(path,0o600);
  let allowedHosts=new Set();
  const server=createServer({requestTimeout:10000,headersTimeout:10000},async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try{
      if(!allowedHosts.has(req.headers.host))throw new CmsError(403,'Недопустимый Host.');
      const origin=`http://${req.headers.host}`;
      if(req.headers.origin&&req.headers.origin!==origin)throw new CmsError(403,'Запрос с другого сайта запрещён.');
      if(req.headers['sec-fetch-site']==='cross-site')throw new CmsError(403,'Запрос с другого сайта запрещён.');
      const url=new URL(req.url,origin),pathname=url.pathname;
      const publicResponse=await publicMenuResponse(new Request(origin+req.url,{method:req.method}),{db:workspace.db,asset:async path=>{
        const relative=path.replace('/preview/','');let file;
        if(relative.startsWith('_astro/'))file=new URL(relative,buildDir);
        else if(relative.startsWith('assets/'))file=new URL(relative,new URL('../streetfood/public/',import.meta.url));
        else file=new URL(relative+'index.html',buildDir);
        try{const bytes=readFileSync(file);const ext=file.pathname.split('.').at(-1);const types={html:'text/html',css:'text/css',js:'text/javascript',svg:'image/svg+xml',webp:'image/webp',woff2:'font/woff2',ttf:'font/ttf'};return new Response(bytes,{headers:{'Content-Type':types[ext]||'application/octet-stream'}});}catch{return new Response(null,{status:404});}
      }});
      if(publicResponse){res.writeHead(publicResponse.status,Object.fromEntries(publicResponse.headers));return res.end(Buffer.from(await publicResponse.arrayBuffer()));}
      if(pathname==='/api/restaurants'||pathname.startsWith('/api/restaurants/')||/^\/api\/(catalogue|settings|images|history|categories|products)(?:\/|$)/.test(pathname)){
        const apiPath=pathname.startsWith('/api/restaurants')?pathname:pathname.replace('/api/','/api/restaurants/'+workspace.restaurantId+'/');
        const bytes=['GET','HEAD'].includes(req.method)?undefined:await new Promise((resolve,reject)=>{let size=0;const chunks=[];req.on('data',chunk=>{size+=chunk.length;if(size<=MAX_BODY)chunks.push(chunk)});req.on('end',()=>size>MAX_BODY?reject(new CmsError(413,'Слишком большой запрос.')):resolve(Buffer.concat(chunks)));req.on('error',reject)});
        const response=await catalogueApi(new Request(origin+apiPath+url.search,{method:req.method,headers:req.headers,body:bytes}),workspace);
        if(!response)throw new CmsError(404,'Не найдено.');
        res.writeHead(response.status,{'Content-Type':'application/json; charset=utf-8'});return res.end(await response.text());
      }
      if(req.method!=='GET'&&req.method!=='HEAD')throw new CmsError(405,'Метод не поддерживается.');
      let file,type;
      if(pathname==='/preview/diner/'){res.writeHead(302,{Location:'/preview/bunhafen/'+url.search});return res.end();}
      if(/^\/preview\/(?:bunhafen\/|pizzeria\/)?$/.test(pathname)){
        let html;
        try{html=readFileSync(new URL(pathname.replace('/preview/','')+'index.html',buildDir),'utf8');}catch{throw new CmsError(503,'Сначала выполни npm run build в корне проекта.');}
        const restaurantId=url.searchParams.get('restaurant')||workspace.restaurantId;
        await createRestaurantStore(workspace.db).access(workspace.user,restaurantId);
        const previewStore=createCloudStore(workspace.db,workspace.images,restaurantId);
        const view=createMenuView((await previewStore.read()).catalogue,'/preview/');
        const data=JSON.stringify(view).replaceAll('<','\\u003c');
        if(!/<script\b[^>]*\bid="menu-data"[^>]*>/.test(html))throw new CmsError(503,'Обнови сборку меню для CMS-предпросмотра.');
        html=html.replace(/(<script\b[^>]*\bid="menu-data"[^>]*>)[\s\S]*?(<\/script>)/,(_,a,b)=>a+data+b).replace('<html','<html data-menu-preview');
        html=html.replace(/data-price-visibility="[^"]*"/,`data-price-visibility="${view.settings.showPrices?'visible':'hidden'}"`).replaceAll('/astro-portfolio/demos/streetfood/','/preview/');
        for(const route of ['impressum','datenschutz'])html=html.replaceAll(`href="/astro-portfolio/${route}/`, `href="https://girda.github.io/astro-portfolio/${route}/`);
        html=html.replace(/href="(\/preview\/(?:bunhafen\/|pizzeria\/)?)"/g,(_,href)=>`href="${href}?restaurant=${restaurantId}"`);
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(html);
      }
      if(pathname==='/qr-generator.mjs'){file=new URL('./node_modules/qrcode-generator/dist/qrcode.mjs',import.meta.url);type='text/javascript';}
      else if(pathname==='/menu-options.mjs'){file=new URL('../streetfood/src/data/menu-options.mjs',import.meta.url);type='text/javascript';}
      else if(pathname==='/'||pathname==='/admin.css'||pathname==='/admin.js'||pathname==='/editor-state.mjs'||pathname==='/menu-links.mjs'||pathname==='/qr-menu.js'||pathname==='/i18n.mjs'||pathname==='/workspaces.js'){file=new URL(pathname==='/'?'index.html':pathname.slice(1),publicDir);type=pathname.endsWith('.css')?'text/css':(pathname.endsWith('.js')||pathname.endsWith('.mjs'))?'text/javascript':'text/html';}
      else if(/^\/appearance-previews\/(?:streetfood|diner|pizzeria)\.png$/.test(pathname)){file=new URL(pathname.slice(1),publicDir);type='image/png';}
      else if(/^\/(?:preview\/)?assets\/menu\/[a-z0-9-]+\.webp$/.test(pathname)){file=new URL(pathname.split('/').at(-1),imagesDir);type='image/webp';}
      else if(/^\/preview\/_astro\/[a-zA-Z0-9_.-]+$/.test(pathname)){const name=pathname.split('/').at(-1);file=new URL('_astro/'+name,buildDir);type=name.endsWith('.css')?'text/css':name.endsWith('.js')?'text/javascript':name.endsWith('.woff2')?'font/woff2':name.endsWith('.ttf')?'font/ttf':name.endsWith('.webp')?'image/webp':name.endsWith('.svg')?'image/svg+xml':'application/octet-stream';}
      else if(['/preview/assets/food.svg','/preview/assets/diner-brand.svg','/preview/assets/bunhafen-brand.svg'].includes(pathname)){file=new URL('../streetfood/public/assets/'+pathname.split('/').at(-1),import.meta.url);type='image/svg+xml';}
      else throw new CmsError(404,'Не найдено.');
      let bytes;try{bytes=readFileSync(file)}catch{throw new CmsError(404,'Файл не найден.');}
      if(type==='text/css')bytes=Buffer.from(bytes.toString('utf8').replaceAll('/astro-portfolio/demos/streetfood/','/preview/'));
      res.writeHead(200,{'Content-Type':type+'; charset=utf-8'});res.end(req.method==='HEAD'?undefined:bytes);
    }catch(error){json(res,error instanceof CmsError?error.status:500,{error:error instanceof CmsError?error.message:'Внутренняя ошибка CMS.'});}
  });
  try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve)});}catch(error){workspace.close();throw error;}
  const actualPort=server.address().port;allowedHosts=new Set([`127.0.0.1:${actualPort}`,`localhost:${actualPort}`]);
  return {url:`http://127.0.0.1:${actualPort}`,store:{...store,saveProduct:(data,options)=>store.save('products',data,options),saveSettings:(data,options)=>store.save('settings',data,options)},server,close:()=>new Promise(resolve=>server.close(()=>{workspace.close();resolve()}))};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const app=await startCms();console.log(`Menu CMS (только локально): ${app.url}`);
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>void app.close().then(()=>process.exit(0)));
}
