import 'leaflet/dist/leaflet.css';
import {locations} from '../data/locations';
const mount=document.querySelector<HTMLElement>('#munich-map');
if(mount){
 const enable=mount.querySelector<HTMLButtonElement>('[data-map-enable]')!;
 const disable=document.querySelector<HTMLButtonElement>('[data-map-disable]')!;
 const notice=mount.firstElementChild!;
 let mapInstance:{remove:()=>void}|undefined,resize:ResizeObserver|undefined,events:AbortController|undefined;
 let pending=false;
 enable.addEventListener('click',async()=>{
  if(pending||mapInstance)return;
  pending=true;enable.disabled=true;
  try{
   const L=await import('leaflet');mount.replaceChildren();events=new AbortController();
   const map=L.map(mount,{scrollWheelZoom:false}).fitBounds(locations.map(l=>[l.lat,l.lng] as [number,number]),{padding:[42,42]});
   mapInstance=map;disable.hidden=false;
   const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(map);
   const markers=new Map();
   const select=(id:string,pan=false)=>{document.querySelectorAll<HTMLButtonElement>('[data-location]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.location===id)));for(const [key,marker]of markers){marker.getElement()?.classList.toggle('is-selected',key===id);if(key===id&&pan)map.panTo(marker.getLatLng(),{animate:!matchMedia('(prefers-reduced-motion:reduce)').matches});}};
   for(const l of locations){
    const marker=L.marker([l.lat,l.lng],{icon:L.divIcon({className:'location-marker',html:`<span aria-hidden="true"><img src="${import.meta.env.BASE_URL}assets/desktop-imgLindenhofLAndRoadWhite.svg" alt=""/></span>`,iconSize:[40,48],iconAnchor:[20,46]}),title:l.name,keyboard:true}).addTo(map);
    const label=document.createElement('span');label.textContent=l.name+' · '+l.address;marker.bindTooltip(label);marker.on('click',()=>select(l.id,true));markers.set(l.id,marker);
   }
   document.querySelectorAll<HTMLButtonElement>('[data-location]').forEach(b=>{
    b.addEventListener('mouseenter',()=>select(b.dataset.location!),{signal:events!.signal});
    b.addEventListener('focus',()=>select(b.dataset.location!),{signal:events!.signal});
    b.addEventListener('click',()=>select(b.dataset.location!,true),{signal:events!.signal});
   });
   select(locations[0].id);resize=new ResizeObserver(()=>map.invalidateSize());resize.observe(mount);
   tiles.on('tileerror',()=>mount.setAttribute('data-tile-error','true'));
   disable.focus({preventScroll:true});
  }catch{
   events?.abort();resize?.disconnect();mapInstance?.remove();mapInstance=undefined;mount.replaceChildren(notice);disable.hidden=true;
   enable.textContent='Karte erneut laden';enable.focus({preventScroll:true});
  }finally{pending=false;enable.disabled=false;}
 });
 disable.addEventListener('click',()=>{
  events?.abort();resize?.disconnect();mapInstance?.remove();mapInstance=undefined;mount.replaceChildren(notice);mount.removeAttribute('data-tile-error');disable.hidden=true;enable.focus({preventScroll:true});
 });
}
