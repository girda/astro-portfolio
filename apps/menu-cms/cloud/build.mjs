import {mkdir,readFile,writeFile,cp,rm,readdir} from 'node:fs/promises';
const output=new URL('../.cloud-assets/',import.meta.url);
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
await cp(new URL('../public/',import.meta.url),output,{recursive:true});
await cp(new URL('../../streetfood/dist/',import.meta.url),new URL('preview/',output),{recursive:true});
await cp(new URL('../../streetfood/public/assets/menu/',import.meta.url),new URL('assets/menu/',output),{recursive:true});
for(const page of ['index.html','diner/index.html','pizzeria/index.html']){
let html=await readFile(new URL('preview/'+page,output),'utf8');
html=html.replaceAll('/astro-portfolio/demos/streetfood/','/preview/');
for(const route of ['impressum','datenschutz'])html=html.replaceAll(`href="/astro-portfolio/${route}/`,`href="https://girda.github.io/astro-portfolio/${route}/`);
await writeFile(new URL('preview/'+page,output),html);
}
// Пути внутри CSS тоже содержат Astro base: переносим их вместе с HTML.
for(const name of await readdir(new URL('preview/_astro/',output))){
 if(!name.endsWith('.css'))continue;
 const file=new URL('preview/_astro/'+name,output);
 await writeFile(file,(await readFile(file,'utf8')).replaceAll('/astro-portfolio/demos/streetfood/','/preview/'));
}
for(const name of ['index.html','admin.js']){
 let text=await readFile(new URL(name,output),'utf8');
 text=text.replaceAll('только на этом компьютере','в закрытой сетевой CMS').replaceAll('Сохранено локально','Сохранено в CMS').replaceAll('Локальная CMS','Закрытая CMS').replaceAll('Локально','В сети').replaceAll('локальная CMS, без отдельных пользователей','владелец CMS; ранние события перенесены из локальной базы').replaceAll('локальной CMS','CMS').replaceAll('локальном меню','черновике меню').replaceAll('локальной библиотеки','библиотеки');
 await writeFile(new URL(name,output),text);
}
await cp(new URL('../../streetfood/src/data/menu-options.mjs',import.meta.url),new URL('menu-options.mjs',output));
await cp(new URL('./public/',import.meta.url),output,{recursive:true});
const index=new URL('index.html',output);
await writeFile(index,(await readFile(index,'utf8')).replace('src="/admin.js"','src="/cloud-shell.js"').replace('</head>','<link rel="stylesheet" href="/account.css"></head>'));
await cp(new URL('../node_modules/qrcode-generator/dist/qrcode.mjs',import.meta.url),new URL('qr-generator.mjs',output));
console.log('Protected CMS assets prepared.');
