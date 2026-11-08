import {createServer} from 'node:http';
import {readFileSync,mkdirSync,chmodSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createMenuStore,CmsError,menuImages} from './store.mjs';
import {createMenuView} from '../streetfood/src/data/menu-view.mjs';
const publicDir=new URL('./public/',import.meta.url);
const buildDir=new URL('../streetfood/dist/',import.meta.url);
const imagesDir=new URL('../streetfood/public/assets/menu/',import.meta.url);
const MAX_BODY=65536;
function body(req){return new Promise((resolve,reject)=>{let size=0;const chunks=[];req.on('data',chunk=>{size+=chunk.length;if(size<=MAX_BODY)chunks.push(chunk)});req.on('end',()=>{if(size>MAX_BODY)return reject(new CmsError(413,'Слишком большой запрос.'));try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch{reject(new CmsError(400,'Некорректный JSON.'))}});req.on('error',reject);});}
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));}
export async function startCms({port=8790,path}={}) {
  if(!path){const directory=new URL('./.local-data/',import.meta.url);mkdirSync(directory,{recursive:true,mode:0o700});path=fileURLToPath(new URL('menu.sqlite',directory));}
  const store=createMenuStore(path);
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
      if(pathname==='/api/catalogue'&&req.method==='GET')return json(res,200,store.read());
      if(pathname==='/api/history'&&req.method==='GET')return json(res,200,store.history({
        before:url.searchParams.has('before')?Number(url.searchParams.get('before')):undefined,
        limit:url.searchParams.has('limit')?Number(url.searchParams.get('limit')):30,
      }));
      if(pathname==='/api/images'&&req.method==='GET')return json(res,200,menuImages);
      if(pathname==='/api/settings'&&req.method==='PUT'){
        if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw new CmsError(415,'Ожидается application/json.');
        const data=await body(req);return json(res,200,store.saveSettings(data,{revision:req.headers['if-match']?Number(req.headers['if-match']):undefined}));
      }
      const match=pathname.match(/^\/api\/(categories|products)(?:\/([a-z0-9-]+))?$/);
      if(match){
        if(!((req.method==='POST'&&!match[2])||(req.method==='PUT'&&match[2])))throw new CmsError(405,'Метод не поддерживается.');
        if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw new CmsError(415,'Ожидается application/json.');
        const data=await body(req);const options={id:match[2],revision:Number(req.headers['if-match'])};
        if(!req.headers['if-match'])options.revision=undefined;
        return json(res,req.method==='POST'?201:200,match[1]==='categories'?store.saveCategory(data,options):store.saveProduct(data,options));
      }
      if(req.method!=='GET'&&req.method!=='HEAD')throw new CmsError(405,'Метод не поддерживается.');
      let file,type;
      if(pathname==='/preview/diner/'){res.writeHead(302,{Location:'/preview/bunhafen/'});return res.end();}
      if(/^\/preview\/(?:bunhafen\/|pizzeria\/)?$/.test(pathname)){
        let html;
        try{html=readFileSync(new URL(pathname.replace('/preview/','')+'index.html',buildDir),'utf8');}catch{throw new CmsError(503,'Сначала выполни npm run build в корне проекта.');}
        const view=createMenuView(store.read().catalogue,'/preview/');
        const data=JSON.stringify(view).replaceAll('<','\\u003c');
        if(!/<script\b[^>]*\bid="menu-data"[^>]*>/.test(html))throw new CmsError(503,'Обнови сборку меню для CMS-предпросмотра.');
        html=html.replace(/(<script\b[^>]*\bid="menu-data"[^>]*>)[\s\S]*?(<\/script>)/,(_,a,b)=>a+data+b).replace('<html','<html data-menu-preview');
        html=html.replace(/data-price-visibility="[^"]*"/,`data-price-visibility="${view.settings.showPrices?'visible':'hidden'}"`).replaceAll('/astro-portfolio/demos/streetfood/','/preview/');
        for(const route of ['impressum','datenschutz'])html=html.replaceAll(`href="/astro-portfolio/${route}/`, `href="https://girda.github.io/astro-portfolio/${route}/`);
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(html);
      }
      if(pathname==='/qr-generator.mjs'){file=new URL('./node_modules/qrcode-generator/dist/qrcode.mjs',import.meta.url);type='text/javascript';}
      else if(pathname==='/menu-options.mjs'){file=new URL('../streetfood/src/data/menu-options.mjs',import.meta.url);type='text/javascript';}
      else if(pathname==='/'||pathname==='/admin.css'||pathname==='/admin.js'||pathname==='/editor-state.mjs'||pathname==='/menu-links.mjs'||pathname==='/qr-menu.js'){file=new URL(pathname==='/'?'index.html':pathname.slice(1),publicDir);type=pathname.endsWith('.css')?'text/css':(pathname.endsWith('.js')||pathname.endsWith('.mjs'))?'text/javascript':'text/html';}
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
  try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve)});}catch(error){store.close();throw error;}
  const actualPort=server.address().port;allowedHosts=new Set([`127.0.0.1:${actualPort}`,`localhost:${actualPort}`]);
  return {url:`http://127.0.0.1:${actualPort}`,store,server,close:()=>new Promise(resolve=>server.close(()=>{store.close();resolve()}))};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const app=await startCms();console.log(`Menu CMS (только локально): ${app.url}`);
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>void app.close().then(()=>process.exit(0)));
}
