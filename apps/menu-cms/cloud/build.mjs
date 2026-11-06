import {mkdir,readFile,writeFile,cp,rm} from 'node:fs/promises';
const output=new URL('../.cloud-assets/',import.meta.url);
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
await cp(new URL('../public/',import.meta.url),output,{recursive:true});
await cp(new URL('../../streetfood/dist/',import.meta.url),new URL('preview/',output),{recursive:true});
await cp(new URL('../../streetfood/public/assets/menu/',import.meta.url),new URL('assets/menu/',output),{recursive:true});
let html=await readFile(new URL('preview/index.html',output),'utf8');
html=html.replaceAll('/astro-portfolio/demos/streetfood/','/preview/');
for(const route of ['impressum','datenschutz'])html=html.replaceAll(`href="/astro-portfolio/${route}/`,`href="https://girda.github.io/astro-portfolio/${route}/`);
await writeFile(new URL('preview/index.html',output),html);
for(const name of ['index.html','admin.js']){
 let text=await readFile(new URL(name,output),'utf8');
 text=text.replaceAll('только на этом компьютере','в закрытой сетевой CMS').replaceAll('Сохранено локально','Сохранено в CMS').replaceAll('Локальная CMS','Закрытая CMS').replaceAll('Локально','В сети').replaceAll('локальная CMS, без отдельных пользователей','владелец CMS; ранние события перенесены из локальной базы').replaceAll('локальной CMS','CMS').replaceAll('локальном меню','черновике меню').replaceAll('локальной библиотеки','библиотеки');
 await writeFile(new URL(name,output),text);
}
console.log('Protected CMS assets prepared.');
