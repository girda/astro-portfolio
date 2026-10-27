import {onPageReady} from '../../../../packages/ui/page-lifecycle';
onPageReady(()=>{
 const events=new AbortController(),options={signal:events.signal};
 const dialog=document.querySelector<HTMLDialogElement>('.eco-gallery-dialog')!;
 const images=[...document.querySelectorAll<HTMLImageElement>('.eco-detail-gallery img')];
 let selected=0;
 const render=()=>{const image=images[selected],target=dialog.querySelector<HTMLImageElement>('[data-gallery-image]')!;target.src=image.src;target.alt=image.alt;dialog.querySelector('[data-gallery-caption]')!.textContent=image.alt;dialog.querySelector('[data-gallery-count]')!.textContent=`${selected+1} / ${images.length}`;};
 document.querySelectorAll('[data-gallery-open]').forEach((b,i)=>b.addEventListener('click',()=>{selected=i;render();dialog.showModal();},options));
 const move=(direction:number)=>{selected=(selected+direction+images.length)%images.length;render();};
 dialog.querySelector('[data-gallery-prev]')!.addEventListener('click',()=>move(-1),options);dialog.querySelector('[data-gallery-next]')!.addEventListener('click',()=>move(1),options);dialog.querySelector('[data-gallery-close]')!.addEventListener('click',()=>dialog.close(),options);
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight')move(1);if(event.key==='ArrowLeft')move(-1);},options);
 document.querySelectorAll<HTMLButtonElement>('[data-eco-floor]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-eco-floor]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const upper=button.dataset.ecoFloor==='1';document.querySelector('[data-plan-living]')!.textContent=upper?'Schlafen / Rückzug':'Wohnen & Essen';document.querySelector('[data-plan-work]')!.textContent=upper?'Ankleide':'Arbeiten / Gast';document.querySelector('[data-plan-room]')!.textContent=upper?'Kind / Gast':'Küche';},options));
 document.querySelector('[data-eco-compare-open]')?.addEventListener('click',()=>{location.href=(document.querySelector<HTMLAnchorElement>('.brand')!.getAttribute('href')||'/')+'#haeuser';},options);
 return()=>{events.abort();if(dialog.open)dialog.close();};
});
