import { onPageReady } from '../../../../packages/ui/page-lifecycle';
import { emptyFilters, selectHouses, type House, type Filters } from '../data/catalogue';

export function initCatalogue() {
  onPageReady(() => {
    const events = new AbortController(), options = { signal: events.signal };
    const form = document.querySelector<HTMLFormElement>('#catalogue-filters')!;
    const sidebar = document.querySelector('.filter-sidebar')!;
    const dialog = document.querySelector<HTMLDialogElement>('#filters-dialog')!;
    const mount = dialog.querySelector('[data-filter-mount]')!;
    const mobile = matchMedia('(max-width:900px)');
    const sort = document.querySelector<HTMLSelectElement>('[data-sort]')!;
    const search = document.querySelector<HTMLInputElement>('[data-search]')!;
    const houses: House[] = JSON.parse(document.getElementById('house-data')!.textContent!);
    const grid = document.querySelector('[data-catalogue-grid]')!;
    const cards = [...grid.querySelectorAll<HTMLElement>('[data-house-card]')];
    const count = document.querySelector<HTMLOutputElement>('[data-result-count]')!;
    const url = new URL(location.href), params = url.searchParams;
    for (const [name,key] of [['materials','material'],['floors','floors'],['bedrooms','bedrooms'],['styles','style'],['roofs','roof']]) {
      form.querySelectorAll<HTMLInputElement>(`[name=${name}]`).forEach(input => input.checked=params.getAll(key).includes(input.value));
    }
    for (const key of ['min','max']) {const raw=params.get(key);if(raw!==null&&Number.isFinite(Number(raw)))form.querySelector<HTMLInputElement>(`[name=${key}]`)!.value=String(Math.max(0,Math.min(400,Number(raw))));}
    search.value=params.get('q')||'';sort.value=['recommended','area-asc','area-desc','name'].includes(params.get('sort')||'')?params.get('sort')!:'recommended';
    function update() {
      const data = new FormData(form),filters:Filters=emptyFilters();
      filters.materials=data.getAll('materials').map(String);filters.floors=data.getAll('floors').map(Number);filters.bedrooms=data.getAll('bedrooms').map(Number);filters.styles=data.getAll('styles').map(String);filters.roofs=data.getAll('roofs').map(String);
      filters.min=Math.max(0,Number(data.get('min'))||0);filters.max=Math.min(400,Number(data.get('max')||400));filters.query=search.value;
      const rangeError=form.querySelector<HTMLElement>('[data-range-error]')!;rangeError.hidden=filters.min<=filters.max;
      const selected=selectHouses(houses,filters,sort.value),ids=selected.map(h=>h.id);
      cards.forEach(card=>card.hidden=!ids.includes(card.dataset.houseCard!));
      ids.forEach(id=>{const card=cards.find(c=>c.dataset.houseCard===id)!;grid.append(card);});
      count.textContent=`${selected.length} ${selected.length===1?'Hausidee':'Hausideen'}`;
      document.querySelector<HTMLElement>('[data-empty-state]')!.hidden=!!selected.length;
      document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category?filters.materials.length===1&&filters.materials[0]===button.dataset.category:!filters.materials.length)));
      const next=new URLSearchParams();
      for(const [values,key] of [[filters.materials,'material'],[filters.floors,'floors'],[filters.bedrooms,'bedrooms'],[filters.styles,'style'],[filters.roofs,'roof']] as const) values.forEach(value=>next.append(key,String(value)));
      if(filters.min)next.set('min',String(filters.min));if(filters.max!==400)next.set('max',String(filters.max));if(filters.query.trim())next.set('q',filters.query.trim());if(sort.value!=='recommended')next.set('sort',sort.value);
      history.replaceState(null,'',location.pathname+(next.size?'?'+next:'')+location.hash);
      form.querySelector<HTMLInputElement>('[data-area-range]')!.value=String(filters.max);
    }
    function moveFilters() {
      if(mobile.matches)mount.append(form);
      else {if(dialog.open)dialog.close();sidebar.append(form);}
    }
    mobile.addEventListener('change',moveFilters,options);moveFilters();
    document.querySelector('[data-open-filters]')!.addEventListener('click',()=>{document.body.style.overflow='hidden';dialog.showModal();},options);
    form.addEventListener('input',event=>{
      if((event.target as HTMLElement).matches('[data-area-range]'))form.querySelector<HTMLInputElement>('[name=max]')!.value=(event.target as HTMLInputElement).value;
      update();
    },options);
    form.addEventListener('submit',event=>{event.preventDefault();update();if(dialog.open&&form.querySelector<HTMLElement>('[data-range-error]')!.hidden)dialog.close();},options);
    form.addEventListener('reset',()=>{queueMicrotask(()=>{if(!events.signal.aborted){search.value='';sort.value='recommended';update();}});},options);
    document.querySelector('[data-reset-filters]')!.addEventListener('click',()=>form.reset(),options);
    document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button=>button.addEventListener('click',()=>{form.querySelectorAll<HTMLInputElement>('[name=materials]').forEach(input=>input.checked=input.value===button.dataset.category);update();},options));
    sort.addEventListener('change',update,options);search.addEventListener('input',update,options);update();
    return()=>{events.abort();if(dialog.open)dialog.close();sidebar.append(form);};
  });
}
