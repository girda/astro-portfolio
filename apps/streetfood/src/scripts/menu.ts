import {formatMoney} from '../data/format-money';
import type {MenuData} from '../data/menu';
import {ALLERGENS} from '../data/menu-options.mjs';
import {cartFlight} from './menu-motion.mjs';
import {applyMenuPresentation} from './menu-presentation';
import {renderPreview} from './preview-menu';
const menuData=JSON.parse(document.getElementById('menu-data')!.textContent!) as MenuData;
renderPreview(menuData);
applyMenuPresentation(menuData);
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
const appearance=document.documentElement.dataset.appearance;
const preferredCategory=appearance==='pizzeria'?'pizza':appearance==='diner'?'burgers':'all';
if(appearance!=='streetfood'){const order=appearance==='pizzeria'?['pizza','antipasti','dolci','coffee']:['burgers','breakfast','sides','coffee','bakery'];const nav=$('.categories');const buttons=all<HTMLButtonElement>('[data-category-select]');buttons.sort((a,b)=>{const rank=(id:string)=>{const i=order.indexOf(id);return i<0?order.length:i;};return rank(a.dataset.categorySelect!)-rank(b.dataset.categorySelect!);});nav.replaceChildren(...buttons);}
let category=products.some(p=>p.category===preferredCategory)?preferredCategory:'all',current=products[0],quantity=1,toastTimer:ReturnType<typeof setTimeout>;
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
function selectCategory(id:string){category=id;filter();const active=document.querySelector<HTMLElement>('.category[aria-pressed=true]');if(active){const nav=$('.categories'),r=active.getBoundingClientRect(),n=nav.getBoundingClientRect();nav.scrollTo({left:nav.scrollLeft+r.left-n.left-(nav.clientWidth-r.width)/2,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});}const heading=document.querySelector('[data-category-title]');if(heading)heading.textContent=id==='pizza'?'Pizza aus dem Ofen':id==='burgers'?'Unsere Burger':categories.find(c=>c.id===id)?.name||'Unsere Speisekarte';}
all('[data-category-select]').forEach(b=>b.addEventListener('click',()=>selectCategory(b.dataset.categorySelect!)));
$('[data-reset]').addEventListener('click',()=>{$<HTMLInputElement>('#menu-search').value='';selectCategory('all');});
$<HTMLInputElement>('#menu-search').addEventListener('input',filter);
$('[data-search-open]').addEventListener('click',()=>{$('.search-bar').hidden=false;requestAnimationFrame(()=>{$('.header-search-control').classList.add('search-open');$('[data-search-open]').setAttribute('aria-expanded','true');$('#menu-search').focus({preventScroll:true});});});
$('#menu-search').addEventListener('keydown',event=>{if(event.key==='Escape')$('[data-search-close]').click();});
$('[data-search-close]').addEventListener('click',()=>{$('.header-search-control').classList.remove('search-open');$('[data-search-open]').setAttribute('aria-expanded','false');$('.search-bar').hidden=true;$<HTMLInputElement>('#menu-search').value='';filter();$('[data-search-open]').focus();});
function syncFavorites(persist=true){all('[data-favorite]').forEach(b=>{b.setAttribute('aria-pressed',String(favorites.has(b.dataset.favorite!)));});if(persist)save('street-food:favorites',[...favorites]);}
all('[data-favorite]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.favorite!;favorites.has(id)?favorites.delete(id):favorites.add(id);syncFavorites();if(category==='favorites')filter();}));syncFavorites(false);
all<HTMLDialogElement>('dialog').forEach(d=>{d.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>d.close()));d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});});
function checkedExtras(){return all<HTMLInputElement>('.extras input:checked').map(i=>i.value);}
function updateProduct(){const price=current.price+checkedExtras().reduce((sum,id)=>sum+extras.find(e=>e.id===id)!.price,0);$('[data-quantity-value]').textContent=String(quantity);$('[data-add-total]').textContent=formatMoney(price*quantity);$<HTMLButtonElement>('[data-quantity="-1"]').disabled=quantity<=1;$<HTMLButtonElement>('[data-quantity="1"]').disabled=quantity>=MAX_QUANTITY;}
function openProduct(id:string){current=products.find(p=>p.id===id)!;quantity=1;all<HTMLInputElement>('.extras input').forEach(i=>i.checked=false);$<HTMLTextAreaElement>('[data-dish-note]').value='';const img=$<HTMLImageElement>('[data-product-image]');img.src=current.image;img.alt=current.name;$('#product-title').textContent=current.name;$('[data-product-description]').textContent=current.description;$('[data-product-allergens]').textContent=ALLERGENS.filter(a=>current.allergenIds?.includes(a.id)).map(a=>a.label).join(', ')||'Keine Angaben — bitte beim Restaurant nachfragen.';$('[data-allergen-heading]').textContent=current.allergensVerified?'Allergene:':'Allergene · Vorschau:';$('[data-product-price]').textContent=formatMoney(current.price);$('[data-product-category]').textContent=`${categories.find(c=>c.id===current.category)!.name} · ${current.time} Min.`;$('.extras').hidden=current.category!=='burgers';updateProduct();
 const card=document.querySelector(`[data-product="${current.id}"]`);const detail=$('.product-detail');detail.querySelectorAll('.detail-variants,.detail-allergens').forEach(el=>el.remove());
 for(const [selector,className]of [['.variant-prices','detail-variants'],['.dish-allergens','detail-allergens']]){const original=card?.querySelector(selector);if(original){const clone=original.cloneNode(true) as HTMLElement;clone.classList.add(className);detail.insertBefore(clone,detail.querySelector(selector==='.dish-allergens'?'.extras':'.allergen-note'));}}
 dialog.showModal();}
all('[data-open]').forEach(b=>b.addEventListener('click',()=>openProduct(b.dataset.open!)));
all('[data-quantity]').forEach(b=>b.addEventListener('click',()=>{quantity=Math.min(MAX_QUANTITY,Math.max(1,quantity+Number(b.dataset.quantity)));updateProduct();}));all('.extras input').forEach(i=>i.addEventListener('change',updateProduct));
function fly(source:HTMLImageElement){
 if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const dock=$('.cart-dock'),from=source.getBoundingClientRect(),to=dock.getBoundingClientRect();
 if(!from.width||!to.width)return;
 const flight=cartFlight(from,to,innerHeight),clone=source.cloneNode() as HTMLImageElement;
 clone.className='flying-dish';clone.alt='';clone.style.left=flight.left+'px';clone.style.top=flight.top+'px';document.body.append(clone);
 clone.animate(flight.keyframes,{duration:850}).finished.then(()=>{
  clone.remove();const basket=dock.querySelector('svg');
  basket?.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-9px) rotate(-5deg)',offset:.35},{transform:'translateY(3px) rotate(3deg)',offset:.7},{transform:'translateY(0) rotate(0)'}],{duration:360,easing:'ease-out'});
 },()=>clone.remove());
}
function add(id:string,qty:number,selected:string[],note:string,source:HTMLImageElement){cart=normalizeCart([...cart,{id,quantity:qty,extras:selected,note}],products,extras);syncCart();fly(source);toast('Im Warenkorb. Gute Wahl!');}
all('[data-add]').forEach(b=>b.addEventListener('click',()=>add(b.dataset.add!,1,[],'',b.closest('.dish-card')!.querySelector('img')!)));
$('[data-product-add]').addEventListener('click',()=>{const source=$<HTMLImageElement>(`[data-product="${current.id}"] img`);dialog.close();add(current.id,quantity,current.category==='burgers'?checkedExtras():[],$<HTMLTextAreaElement>('[data-dish-note]').value,source);});
function element(tag:string,text?:string,className?:string){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;}
function syncCart(persist=true){if(persist)save(storageKey,cart);const total=cartTotal(cart,products,extras),count=cart.reduce((s,l)=>s+l.quantity,0);$('[data-cart-label]').textContent=count?`${count} ${count===1?'Gericht':'Gerichte'} im Warenkorb`:'Dein Warenkorb';$('[data-cart-total]').textContent=formatMoney(total);all('[data-cart-count]').forEach(node=>node.textContent=String(count));$('[data-summary-total]').textContent=formatMoney(total);$<HTMLButtonElement>('[data-checkout]').disabled=!cart.length;$('.order-confirmation').hidden=true;renderCart();}
function renderCart(){const target=$('[data-cart-items]');target.replaceChildren();if(!cart.length){target.append(element('p','Dein Warenkorb ist noch leer. Such dir etwas Gutes aus.','demo-note'));return;}for(const line of cart){const product=products.find(p=>p.id===line.id)!;const row=element('article',undefined,'cart-line'),img=document.createElement('img'),body=element('div'),price=element('strong',formatMoney(unitPrice(line,products,extras)*line.quantity));img.src=product.image;img.alt=product.name;imageFallback(img);body.append(element('h3',product.name));const details=[...line.extras.map(id=>extras.find(e=>e.id===id)!.name),line.note].filter(Boolean).join(' · ');if(details)body.append(element('p',details));const controls=element('div',undefined,'quantity');for(const direction of [-1,1]){const button=element('button',direction===-1?'−':'+') as HTMLButtonElement;button.type='button';button.setAttribute('aria-label',`${product.name}: ${direction===-1?'Menge verringern':'Menge erhöhen'}`);button.disabled=direction===1&&line.quantity>=MAX_QUANTITY;button.addEventListener('click',()=>{line.quantity+=direction;cart=cart.filter(l=>l.quantity>0);syncCart();const rows=all('.cart-line');rows.find(r=>r.querySelector('h3')?.textContent===product.name)?.querySelector<HTMLButtonElement>('.quantity button')?.focus();});controls.append(button);if(direction===-1)controls.append(element('span',String(line.quantity)));}body.append(controls);row.append(img,body,price);target.append(row);}}
all('[data-cart-open]').forEach(button=>button.addEventListener('click',()=>{renderCart();cartDialog.showModal();}));$('[data-checkout]').addEventListener('click',()=>{if(!cart.length)return;$('.order-confirmation').hidden=false;$('.order-confirmation').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'nearest'});});
$('[data-menu-open]').addEventListener('click',()=>$<HTMLDialogElement>('[data-nav-dialog]').showModal());all('[data-nav-category]').forEach(b=>b.addEventListener('click',()=>{selectCategory(b.dataset.navCategory!);$<HTMLDialogElement>('[data-nav-dialog]').close();}));
syncCart(false);filter();
