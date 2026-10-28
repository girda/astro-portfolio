import { onPageReady } from '../../../../packages/ui/page-lifecycle';
import { galleryCopy, projectGroups, selectProjectPage, PROJECTS_PER_PAGE } from '../data/project-gallery';
import type { Language } from '../i18n/translations';
export function initProjectGallery() {
 onPageReady(() => {
  const events = new AbortController();
  document.querySelectorAll<HTMLElement>('[data-project-gallery]').forEach(root => {
   const copy=galleryCopy[root.dataset.lang as Language];
   const items=[...root.querySelectorAll<HTMLElement>('[data-project-item]')].map(node=>({node,group:node.dataset.group!}));
   const buttons=[...root.querySelectorAll<HTMLButtonElement>('[data-project-filter]')];
   const nav=root.querySelector<HTMLElement>('[data-project-pagination]')!;
   const numbers=root.querySelector<HTMLElement>('[data-page-numbers]')!;
   const previous=root.querySelector<HTMLButtonElement>('[data-page-previous]')!, next=root.querySelector<HTMLButtonElement>('[data-page-next]')!;
   let group='all',page=1;
   function update(scroll=false,store=true) {
    const result=selectProjectPage(items,group,page);page=result.current;
    items.forEach(item=>item.node.hidden=!result.items.includes(item));
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.projectFilter===group)));
    root.querySelector('output')!.textContent=`${result.total ? (page-1)*PROJECTS_PER_PAGE+1 : 0}–${Math.min(page*PROJECTS_PER_PAGE,result.total)} / ${result.total}`;
    root.querySelector<HTMLElement>('[data-project-empty]')!.hidden=!!result.total;
    nav.hidden=result.pages<2;previous.disabled=page===1;next.disabled=page===result.pages;numbers.replaceChildren();
    for(let i=1;i<=result.pages;i++){const button=document.createElement('button');button.type='button';button.textContent=String(i);button.dataset.page=String(i);button.setAttribute('aria-label',`${copy.page} ${i} ${copy.of} ${result.pages}`);if(i===page)button.setAttribute('aria-current','page');numbers.append(button);}
    if(root.dataset.catalogue==='true'&&store){const url=new URL(location.href);if(group==='all')url.searchParams.delete('category');else url.searchParams.set('category',group);if(page===1)url.searchParams.delete('page');else url.searchParams.set('page',String(page));history.replaceState(null,'',url);}
    if(scroll){root.scrollIntoView({behavior:'instant',block:'start'});root.querySelector<HTMLAnchorElement>('[data-project-item]:not([hidden]) a')?.focus({preventScroll:true});}
   }
   function restore(){const query=new URLSearchParams(location.search);const raw=query.get('category');group=root.dataset.catalogue==='true'&&projectGroups.includes(raw as typeof projectGroups[number])?raw!:'all';page=root.dataset.catalogue==='true'?Number(query.get('page')||1):1;update(false,false);}
   buttons.forEach(button=>button.addEventListener('click',()=>{group=button.dataset.projectFilter!;page=1;update();},{signal:events.signal}));
   nav.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button||button.disabled)return;page=button===previous?page-1:button===next?page+1:Number(button.dataset.page);update(true);},{signal:events.signal});
   window.addEventListener('popstate',restore,{signal:events.signal});restore();
  });
  return()=>events.abort();
 });
}
