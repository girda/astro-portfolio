import { onPageReady } from '../../../../packages/ui/page-lifecycle';
import { houses } from '../data/houses';
onPageReady(() => {
 const form = document.querySelector<HTMLFormElement>('#consultation');
 const dialog = document.querySelector<HTMLDialogElement>('#form-dialog');
 if (!form || !dialog) return;
 const events = new AbortController(), options = { signal: events.signal };
 const selected = houses.find(h => h.id === new URL(location.href).searchParams.get('house'));
 if (selected) form.querySelector<HTMLSelectElement>('[name=house]')!.value = selected.name;
 form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form), summary = dialog.querySelector('#form-summary')!;
  summary.replaceChildren(...[['Name',data.get('name')],['E-Mail',data.get('email')],['Hausidee',data.get('house')],['Wünsche',data.get('message') || 'Noch offen']].map(([label,value]) => {
   const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
   dt.textContent=String(label);dd.textContent=String(value);row.append(dt,dd);return row;
  }));
  dialog.showModal();
 }, options);
 dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close(),options));
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();},options);
 return()=>{events.abort();if(dialog.open)dialog.close();};
});
