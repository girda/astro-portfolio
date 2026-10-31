import {formatMoney} from '../data/format-money';
import type {MenuData} from '../data/menu';
import {renderPreview} from './preview-menu';
const menuData=JSON.parse(document.getElementById('menu-data')!.textContent!) as MenuData;
renderPreview(menuData);
const {products,extras,categories}=menuData;
import {normalizeCart,unitPrice,cartTotal,MAX_QUANTITY} from './cart.mjs';
const $=<T extends HTMLElement=HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
const all=<T extends HTMLElement=HTMLElement>(selector:string)=>[...document.querySelectorAll<T>(selector)];
const read=(key:string,fallback:any)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}};
const save=(key:string,value:unknown)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Работа без постоянного хранилища. */}};
const storageKey='street-food:cart:v1';
let cart=normalizeCart(read(storageKey,[]),products,extras);
const savedFavorites=read('street-food:favorites',[]);
let favorites=new Set<string>(Array.isArray(savedFavorites)?savedFavorites.filter(id=>products.some(p=>p.id===id)):[]);
const savedLocation=read('street-food:location','');
let locationName=['Street Food · Altstadt','Street Food · Am Park'].includes(savedLocation)?savedLocation:'';
let category='all',current=products[0],quantity=1,toastTimer:ReturnType<typeof setTimeout>;
const dialog=$<HTMLDialogElement>('[data-product-dialog]'),cartDialog=$<HTMLDialogElement>('[data-cart-dialog]');
function toast(message:string){const node=$('.toast');node.textContent=message;node.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('visible'),2200);}
function imageFallback(img: HTMLImageElement) {
  const fallback = new URL(document.querySelector<HTMLImageElement>('img[data-fallback]')?.dataset.fallback || import.meta.env.BASE_URL + 'assets/food.svg', location.origin).href;
  const recover = () => { if (img.src !== fallback) img.src = fallback; };
  // Диалог переиспользует один img: резервная картинка нужна при каждой ошибке загрузки.
  img.addEventListener('error', recover);
  if (img.getAttribute('src') && img.complete && !img.naturalWidth) recover();
}
all<HTMLImageElement>('img').forEach(imageFallback);
function filter(){const query=$<HTMLInputElement>('#menu-search').value.trim().toLocaleLowerCase('de');let count=0;all('[data-product]').forEach(card=>{const p=products.find(p=>p.id===card.dataset.product)!;const show=(category==='all'||(category==='favorites'?favorites.has(p.id):p.category===category))&&`${p.name} ${p.description}`.toLocaleLowerCase('de').includes(query);card.hidden=!show;if(show)count++;});$('[data-results]').textContent=`${count} ${count===1?'Gericht':'Gerichte'}`;$('.empty-state').hidden=count>0;$('[data-empty-text]').textContent=category==='favorites'?'Tippe auf ein Herz, um deine Lieblingsgerichte hier zu sammeln.':'Probiere eine andere Suche oder Kategorie.';all('[data-category-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.categorySelect===category)));}
function selectCategory(id:string){category=id;filter();}
all('[data-category-select]').forEach(b=>b.addEventListener('click',()=>selectCategory(b.dataset.categorySelect!)));
$('[data-reset]').addEventListener('click',()=>{$<HTMLInputElement>('#menu-search').value='';selectCategory('all');});
$<HTMLInputElement>('#menu-search').addEventListener('input',filter);
$('[data-search-open]').addEventListener('click',()=>{$('.search-bar').hidden=false;$('#menu-search').focus();});
$('[data-search-close]').addEventListener('click',()=>{$('.search-bar').hidden=true;$<HTMLInputElement>('#menu-search').value='';filter();$('[data-search-open]').focus();});
function syncFavorites(persist=true){all('[data-favorite]').forEach(b=>{b.setAttribute('aria-pressed',String(favorites.has(b.dataset.favorite!)));});if(persist)save('street-food:favorites',[...favorites]);}
all('[data-favorite]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.favorite!;favorites.has(id)?favorites.delete(id):favorites.add(id);syncFavorites();if(category==='favorites')filter();}));syncFavorites(false);
all<HTMLDialogElement>('dialog').forEach(d=>{d.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>d.close()));d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});});
function checkedExtras(){return all<HTMLInputElement>('.extras input:checked').map(i=>i.value);}
function updateProduct(){const price=current.price+checkedExtras().reduce((sum,id)=>sum+extras.find(e=>e.id===id)!.price,0);$('[data-quantity-value]').textContent=String(quantity);$('[data-add-total]').textContent=formatMoney(price*quantity);$<HTMLButtonElement>('[data-quantity="-1"]').disabled=quantity<=1;$<HTMLButtonElement>('[data-quantity="1"]').disabled=quantity>=MAX_QUANTITY;}
function openProduct(id:string){current=products.find(p=>p.id===id)!;quantity=1;all<HTMLInputElement>('.extras input').forEach(i=>i.checked=false);$<HTMLTextAreaElement>('[data-dish-note]').value='';const img=$<HTMLImageElement>('[data-product-image]');img.src=current.image;img.alt=current.name;$('#product-title').textContent=current.name;$('[data-product-description]').textContent=current.description;$('[data-product-allergens]').textContent=current.allergens;$('[data-product-price]').textContent=formatMoney(current.price);$('[data-product-category]').textContent=`${categories.find(c=>c.id===current.category)!.name} · ${current.time} Min.`;$('.extras').hidden=current.category!=='burgers';updateProduct();dialog.showModal();}
all('[data-open]').forEach(b=>b.addEventListener('click',()=>openProduct(b.dataset.open!)));
all('[data-quantity]').forEach(b=>b.addEventListener('click',()=>{quantity=Math.min(MAX_QUANTITY,Math.max(1,quantity+Number(b.dataset.quantity)));updateProduct();}));all('.extras input').forEach(i=>i.addEventListener('change',updateProduct));
function fly(source:HTMLImageElement){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const from=source.getBoundingClientRect(),to=$('[data-cart-open]').getBoundingClientRect();if(!from.width||from.bottom<0)return;const clone=source.cloneNode() as HTMLImageElement;clone.className='flying-dish';clone.style.left=from.left+from.width/2-32+'px';clone.style.top=from.top+from.height/2-32+'px';document.body.append(clone);const x=to.left+42-(from.left+from.width/2),y=to.top+to.height/2-(from.top+from.height/2);clone.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${x*.4}px,${Math.min(-60,y*.25)}px) scale(.85)`,opacity:1,offset:.4},{transform:`translate(${x}px,${y}px) scale(.2)`,opacity:0}],{duration:650,easing:'cubic-bezier(.25,.5,.45,1)'}).finished.then(()=>clone.remove(),()=>clone.remove());}
function add(id:string,qty:number,selected:string[],note:string,source:HTMLImageElement){cart=normalizeCart([...cart,{id,quantity:qty,extras:selected,note}],products,extras);syncCart();fly(source);toast('Im Warenkorb. Gute Wahl!');}
all('[data-add]').forEach(b=>b.addEventListener('click',()=>add(b.dataset.add!,1,[],'',b.closest('.dish-card')!.querySelector('img')!)));
$('[data-product-add]').addEventListener('click',()=>{const source=$<HTMLImageElement>(`[data-product="${current.id}"] img`);dialog.close();add(current.id,quantity,current.category==='burgers'?checkedExtras():[],$<HTMLTextAreaElement>('[data-dish-note]').value,source);});
function element(tag:string,text?:string,className?:string){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;}
function syncCart(persist=true){if(persist)save(storageKey,cart);const total=cartTotal(cart,products,extras),count=cart.reduce((s,l)=>s+l.quantity,0);$('[data-cart-label]').textContent=count?`${count} ${count===1?'Gericht':'Gerichte'} im Warenkorb`:'Dein Warenkorb';$('[data-cart-total]').textContent=formatMoney(total);$('[data-summary-total]').textContent=formatMoney(total);$<HTMLButtonElement>('[data-checkout]').disabled=!cart.length;$('.order-confirmation').hidden=true;renderCart();}
function renderCart(){const target=$('[data-cart-items]');target.replaceChildren();if(!cart.length){target.append(element('p','Dein Warenkorb ist noch leer. Such dir etwas Gutes aus.','demo-note'));return;}for(const line of cart){const product=products.find(p=>p.id===line.id)!;const row=element('article',undefined,'cart-line'),img=document.createElement('img'),body=element('div'),price=element('strong',formatMoney(unitPrice(line,products,extras)*line.quantity));img.src=product.image;img.alt=product.name;imageFallback(img);body.append(element('h3',product.name));const details=[...line.extras.map(id=>extras.find(e=>e.id===id)!.name),line.note].filter(Boolean).join(' · ');if(details)body.append(element('p',details));const controls=element('div',undefined,'quantity');for(const direction of [-1,1]){const button=element('button',direction===-1?'−':'+') as HTMLButtonElement;button.type='button';button.setAttribute('aria-label',`${product.name}: ${direction===-1?'Menge verringern':'Menge erhöhen'}`);button.disabled=direction===1&&line.quantity>=MAX_QUANTITY;button.addEventListener('click',()=>{line.quantity+=direction;cart=cart.filter(l=>l.quantity>0);syncCart();const rows=all('.cart-line');rows.find(r=>r.querySelector('h3')?.textContent===product.name)?.querySelector<HTMLButtonElement>('.quantity button')?.focus();});controls.append(button);if(direction===-1)controls.append(element('span',String(line.quantity)));}body.append(controls);row.append(img,body,price);target.append(row);}}
$('[data-cart-open]').addEventListener('click',()=>{renderCart();cartDialog.showModal();});$('[data-checkout]').addEventListener('click',()=>{if(!cart.length)return;$('.order-confirmation').hidden=false;$('.order-confirmation').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'nearest'});});
function syncLocation(){$('[data-location-open]').textContent=locationName||'Standort auswählen';$('[data-cart-location]').textContent=(locationName||'Demo-Standort noch offen')+' · Abholung';}
$('[data-location-open]').addEventListener('click',()=>$<HTMLDialogElement>('[data-location-dialog]').showModal());all('[data-location]').forEach(b=>b.addEventListener('click',()=>{locationName=b.dataset.location!;save('street-food:location',locationName);syncLocation();$<HTMLDialogElement>('[data-location-dialog]').close();}));
$('[data-menu-open]').addEventListener('click',()=>$<HTMLDialogElement>('[data-nav-dialog]').showModal());all('[data-nav-category]').forEach(b=>b.addEventListener('click',()=>{selectCategory(b.dataset.navCategory!);$<HTMLDialogElement>('[data-nav-dialog]').close();}));
syncLocation();syncCart(false);filter();
