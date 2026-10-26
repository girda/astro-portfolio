import 'leaflet/dist/leaflet.css';
import {locations} from '../data/locations';
const mount=document.querySelector<HTMLElement>('#munich-map');
if(mount){
 const observer=new IntersectionObserver(async entries=>{if(!entries.some(e=>e.isIntersecting))return;observer.disconnect();
 try{
 const L=await import('leaflet');mount.replaceChildren();
 const map=L.map(mount,{scrollWheelZoom:false}).fitBounds(locations.map(l=>[l.lat,l.lng] as [number,number]),{padding:[42,42]});
 const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
 const markers=new Map();
 const select=(id:string,pan=false)=>{document.querySelectorAll<HTMLButtonElement>('[data-location]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.location===id)));for(const [key,marker]of markers){marker.getElement()?.classList.toggle('is-selected',key===id);if(key===id&&pan)map.panTo(marker.getLatLng(),{animate:!matchMedia('(prefers-reduced-motion:reduce)').matches});}};
 for(const l of locations){const marker=L.marker([l.lat,l.lng],{icon:L.divIcon({className:'location-marker',html:`<span aria-hidden="true"><img src="${import.meta.env.BASE_URL}assets/desktop-imgLindenhofLAndRoadWhite.svg" alt=""/></span>`,iconSize:[40,48],iconAnchor:[20,46]}),title:l.name,keyboard:true}).addTo(map);const label=document.createElement('span');label.textContent=l.name+' · '+l.address;marker.bindTooltip(label);marker.on('click',()=>select(l.id,true));markers.set(l.id,marker);}
 document.querySelectorAll<HTMLButtonElement>('[data-location]').forEach(b=>{b.addEventListener('mouseenter',()=>select(b.dataset.location!));b.addEventListener('focus',()=>select(b.dataset.location!));b.addEventListener('click',()=>select(b.dataset.location!,true));});
 select(locations[0].id);new ResizeObserver(()=>map.invalidateSize()).observe(mount);
 tiles.on('tileerror',()=>mount.setAttribute('data-tile-error','true'));
 }catch{const p=mount.querySelector('p')??mount.appendChild(document.createElement('p'));p.className='map-fallback';p.textContent='Die Karte ist gerade nicht verfügbar. Öffne deine Route über den gewünschten Orientierungspunkt.';}
 },{rootMargin:'300px'});observer.observe(mount);
}
