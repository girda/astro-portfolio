import {t,getLocale,initLanguage,applyLanguage,allergenLabel} from './i18n.mjs';
import qrcode from './qr-generator.mjs';
import {MENU_APPEARANCES,DEFAULT_MENU_ROOT,buildMenuUrl} from './menu-links.mjs';
const $=selector=>document.querySelector(selector);
const form=$('#qr-form'),theme=form.elements.namedItem('appearance'),root=form.elements.namedItem('root');
for(const item of MENU_APPEARANCES){const option=document.createElement('option');option.value=item.id;option.textContent=item.name;theme.append(option);}
root.value=DEFAULT_MENU_ROOT;
try{const saved=JSON.parse(localStorage.getItem('my-menu:qr')||'null');if(saved){root.value=saved.root||DEFAULT_MENU_ROOT;if(MENU_APPEARANCES.some(a=>a.id===saved.appearance))theme.value=saved.appearance;}}catch{}
let current=null,svgUrl='';
function clear(){current=null;$('#qr-output').replaceChildren();$('#qr-download-svg').removeAttribute('href');$('#qr-download-svg').setAttribute('aria-disabled','true');$('#qr-download-png').disabled=true;$('#qr-open').removeAttribute('href');$('#qr-link').textContent='';if(svgUrl){URL.revokeObjectURL(svgUrl);svgUrl='';}}
function generate(){
 clear();try{
  const url=buildMenuUrl(root.value,theme.value),qr=qrcode(0,'M');qr.addData(url,'Byte');qr.make();
  const svg=qr.createSvgTag({cellSize:6,margin:24,scalable:true});
  // Библиотека рисует только геометрию модулей, без вставки пользовательского текста в SVG.
  $('#qr-output').innerHTML=svg;$('#qr-output svg').setAttribute('aria-label',t('QR-код меню'));$('#qr-output svg').setAttribute('role','img');
  svgUrl=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const download=$('#qr-download-svg');download.href=svgUrl;download.download='menu-'+theme.value+'.svg';download.removeAttribute('aria-disabled');
  $('#qr-download-png').disabled=false;$('#qr-link').textContent=url;$('#qr-open').href=url;$('#qr-status').textContent=t('QR готов. Проверь адрес перед печатью.');current={qr,url,appearance:theme.value};
  try{localStorage.setItem('my-menu:qr',JSON.stringify({root:root.value,appearance:theme.value}));}catch{}
 }catch(error){$('#qr-status').textContent=t(error.message);}
}
form.addEventListener('submit',event=>{event.preventDefault();generate();});
form.addEventListener('input',()=>{clear();$('#qr-status').textContent=t('Нажми «Создать QR», чтобы применить изменения.');});
$('#qr-download-png').addEventListener('click',()=>{
 if(!current)return;const {qr,appearance}=current,count=qr.getModuleCount(),cell=12,quiet=4,canvas=document.createElement('canvas');canvas.width=canvas.height=(count+quiet*2)*cell;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#000';
 for(let r=0;r<count;r++)for(let c=0;c<count;c++)if(qr.isDark(r,c))ctx.fillRect((c+quiet)*cell,(r+quiet)*cell,cell,cell);
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='menu-'+appearance+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
});
generate();
