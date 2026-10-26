import {onPageReady} from '../../../../packages/ui/page-lifecycle';
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
export function showDevelopment(custom?:string){
 const dialog=document.querySelector<HTMLDialogElement>('#development-dialog');if(!dialog)return;
 const title=dialog.querySelector('#dialog-title'),message=dialog.querySelector('#dialog-message');
 if(title)title.textContent=custom?'Dein nächster Schritt.':'Hier entsteht etwas Neues.';
 if(message)message.textContent=custom??'Dieser Bereich ist noch in Entwicklung. Entdecke inzwischen unsere Fahrzeuge oder stelle uns deine Fragen direkt.';
 if(!dialog.open)dialog.showModal();
}
export function initNavigation(){onPageReady(()=>{
 const events=new AbortController(),options={signal:events.signal};
 const menu=document.querySelector<HTMLDialogElement>('#navigation-dialog'),trigger=document.querySelector<HTMLButtonElement>('.menu-trigger'),header=document.querySelector<HTMLElement>('.site-header');
 if(!menu||!trigger||!header)return;
 let closing=false,oldOverflow='';
 const closeMenu=()=>{if(!menu.open||closing)return;closing=true;menu.classList.add('is-closing');const finish=()=>{menu.close();menu.classList.remove('is-closing');closing=false;};if(reduced())finish();else menu.animate([{transform:'translateX(0)'},{transform:'translateX(-100%)'}],{duration:240,easing:'cubic-bezier(.4,0,1,1)'}).finished.then(finish).catch(finish);};
 trigger.addEventListener('click',()=>{oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';menu.showModal();trigger.setAttribute('aria-expanded','true');},options);
 menu.addEventListener('cancel',event=>{event.preventDefault();closeMenu();},options);
 menu.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;trigger.setAttribute('aria-expanded','false');},options);
 menu.addEventListener('click',event=>{if(event.target===menu){const r=menu.getBoundingClientRect();if(event.clientX>r.right||event.clientX<r.left)closeMenu();}},options);
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu,options));
 document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog=>dialog.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>dialog===menu?closeMenu():dialog.close(),options)));
 document.querySelectorAll<HTMLElement>('[data-development]').forEach(button=>button.addEventListener('click',()=>{if(menu.open){menu.close();}showDevelopment();},options));
 const sentinel=document.querySelector('.header-sentinel');const observer=new IntersectionObserver(entries=>header.classList.toggle('is-compact',!entries[0].isIntersecting));if(sentinel)observer.observe(sentinel);
 header.querySelectorAll<HTMLDetailsElement>('.header-nav details').forEach(details=>details.addEventListener('toggle',()=>{if(details.open&&details.parentElement?.parentElement?.classList.contains('menu-depth-1'))header.querySelectorAll<HTMLDetailsElement>('.menu-depth-1>li>details').forEach(other=>{if(other!==details)other.open=false;});},options));
 document.addEventListener('click',event=>{if(!header.contains(event.target as Node))header.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(d=>d.open=false);},options);
 return()=>{events.abort();observer.disconnect();if(menu.open)menu.close();document.body.style.overflow=oldOverflow;};
});}
