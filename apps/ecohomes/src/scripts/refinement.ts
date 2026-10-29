import { onPageReady } from '../../../../packages/ui/page-lifecycle';
interface House {id:string;name:string;area:string;rooms:string;type:string;image:string;features:string[]}
export function initEnhancements() {
 onPageReady(() => {
  const events=new AbortController(),options={signal:events.signal};
  const houses:House[]=JSON.parse(document.getElementById('house-data')!.textContent!);
  const dialog=document.querySelector<HTMLDialogElement>('#eco-compare-dialog')!;
  let selected:string[]=[];
  try{const raw=JSON.parse(localStorage.getItem('eichenhain:compared')||'[]');if(Array.isArray(raw))selected=[...new Set(raw.filter(id=>houses.some(h=>h.id===id)))].slice(0,3);}catch{/* Локальный выбор доступен без хранилища. */}
  function sync(persist=true){
   document.querySelectorAll<HTMLButtonElement>('[data-eco-compare]').forEach(b=>b.setAttribute('aria-pressed',String(selected.includes(b.dataset.ecoCompare!))));
   const count=document.querySelector<HTMLElement>('[data-eco-compare-count]')!;count.hidden=!selected.length;count.textContent=String(selected.length);
   try{if(persist)localStorage.setItem('eichenhain:compared',JSON.stringify(selected));}catch{}
  }
  document.querySelectorAll<HTMLButtonElement>('[data-eco-compare]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.ecoCompare!;selected=selected.includes(id)?selected.filter(value=>value!==id):[...selected,id].slice(-3);sync();},options));sync(false);
  document.querySelector('[data-eco-compare-open]')!.addEventListener('click',()=>{
   const output=document.querySelector('[data-eco-compare-output]')!;output.replaceChildren();
   if(!selected.length){const p=document.createElement('p');p.textContent='Wähle bis zu drei Hausideen über das Vergleichssymbol in den Karten aus.';output.append(p);}
   else{const grid=document.createElement('div');grid.className='eco-compare-grid';grid.style.setProperty('--columns',String(selected.length));for(const id of selected){const house=houses.find(h=>h.id===id)!;const article=document.createElement('article'),img=document.createElement('img'),title=document.createElement('h3'),list=document.createElement('dl');img.src=house.image;img.alt=house.name;title.textContent=house.name;for(const [label,value] of [['Wohnfläche',house.area],['Zimmer',house.rooms],['Haustyp',house.type],['Geschosse',house.type==='Bungalow'?'1':'2']]){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);list.append(row);}const button=document.createElement('a');button.className='text-button';button.textContent='Hausidee ansehen';button.href=(document.querySelector<HTMLAnchorElement>('.brand')!.getAttribute('href')||'/')+'haeuser/'+house.id+'/';article.append(img,title,list,button);grid.append(article);}output.append(grid);}
   dialog.showModal();
  },options);
  document.querySelectorAll<HTMLButtonElement>('[data-energy-mode]').forEach(button=>button.addEventListener('click',()=>{
   const night=button.dataset.energyMode==='night';document.querySelector('.energy-visual')!.classList.toggle('is-night',night);
   document.querySelectorAll('[data-energy-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   document.querySelector('[data-energy-mode-note]')!.textContent=night?'Nachts: Gespeicherten Strom nutzen — abhängig vom Verbrauch und der verfügbaren Kapazität.':'Tagsüber: Sonnenstrom direkt nutzen und im Speicher bereithalten.';
  },options));
  return()=>{events.abort();if(dialog.open)dialog.close();};
 });
}
