export const MENU_APPEARANCES=Object.freeze([
 {id:'streetfood',name:'Street Food',description:'Светлое меню с крупными фотографиями.',path:''},
 {id:'diner',name:'Diner',description:'Графит, контрастные цены и характер закусочной.',path:'diner/'},
 {id:'pizzeria',name:'Pizzeria',description:'Тёплая бумага, бордовый и итальянская типографика.',path:'pizzeria/'}
]);
export const DEFAULT_MENU_ROOT='https://girda.github.io/astro-portfolio/demos/streetfood/';
export function buildMenuUrl(root,appearance){
 const theme=MENU_APPEARANCES.find(item=>item.id===appearance);
 if(!theme)throw new Error('Выбери оформление меню.');
 let url;try{url=new URL(root.trim());}catch{throw new Error('Введи полный адрес, начиная с https://.');}
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.href.length>1000)throw new Error('Нужен HTTPS-адрес без пароля, параметров и #.');
 if(['localhost','127.0.0.1','0.0.0.0','[::1]'].includes(url.hostname))throw new Error('Для QR нужен публичный адрес, доступный с телефона.');
 if(!url.pathname.endsWith('/'))url.pathname+='/';
 return new URL(theme.path,url).href;
}
