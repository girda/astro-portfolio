import {t,initLanguage} from './i18n.mjs';
const element=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=t(text);return el;};
async function request(path,options={}){
 const response=await fetch(path,{...options,headers:{'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(12000)});
 const data=await response.json();if(!response.ok)throw new Error(t(data.error||'Ошибка запроса'));return data;
}
function openRestaurant(id){const url=new URL(location.href);url.searchParams.set('restaurant',id);location.assign(url);}
export async function initWorkspace(){
 const {restaurants}=await request('/api/restaurants');
 const requested=new URL(location.href).searchParams.get('restaurant');
 const restaurant=restaurants.find(r=>r.id===(requested||restaurants[0]?.id));
 const controls=element('div');controls.className='workspace-controls';
 const label=element('label','Ресторан'),select=element('select');select.setAttribute('aria-label',t('Ресторан'));
 for(const item of restaurants){const option=element('option');option.value=item.id;option.textContent=item.name;select.append(option);}
 if(restaurant)select.value=restaurant.id;
 select.addEventListener('change',()=>{const id=select.value;select.value=restaurant?.id||'';const event=new CustomEvent('cms-workspace-request',{cancelable:true,detail:{navigate:()=>openRestaurant(id)}});if(document.dispatchEvent(event))openRestaurant(id);});
 label.append(select);
 const add=element('button','Создать ресторан');add.type='button';add.className='secondary small';controls.append(label,add);document.querySelector('.app-header').append(controls);
 const dialog=element('dialog');dialog.className='restaurant-dialog';dialog.setAttribute('aria-labelledby','restaurant-create-title');
 const form=element('form'),title=element('h2','Новый ресторан');title.id='restaurant-create-title';
 const nameLabel=element('label','Название ресторана'),name=element('input');name.name='name';name.required=true;name.minLength=2;name.maxLength=100;name.autocomplete='organization';nameLabel.append(name);
 const slugLabel=element('label','Адрес ресторана'),slug=element('input');slug.name='slug';slug.required=true;slug.minLength=3;slug.maxLength=63;slug.pattern='[a-z0-9]+(-[a-z0-9]+)*';slug.autocapitalize='none';slug.spellcheck=false;slugLabel.append(slug);
 const note=element('p','Латинские буквы, цифры и дефис. Публичный адрес подключим на следующем этапе.');note.className='muted';
 const actions=element('div'),close=element('button','Отмена'),save=element('button','Создать');close.type='button';close.className='secondary';actions.className='restaurant-actions';actions.append(close,save);
 const status=element('p');status.setAttribute('role','status');form.append(title,nameLabel,slugLabel,note,status,actions);dialog.append(form);document.body.append(dialog);
 name.addEventListener('input',()=>{if(!slug.dataset.edited)slug.value=name.value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,63);});slug.addEventListener('input',()=>slug.dataset.edited='true');
 add.addEventListener('click',()=>{const event=new CustomEvent('cms-workspace-request',{cancelable:true,detail:{navigate:()=>dialog.showModal()}});if(document.dispatchEvent(event))dialog.showModal();});close.addEventListener('click',()=>dialog.close());
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;save.disabled=true;close.disabled=true;dialog.dataset.saving='true';
  try{const result=await request('/api/restaurants',{method:'POST',body:JSON.stringify({name:name.value,slug:slug.value})});openRestaurant(result.restaurant.id);}
  catch(error){status.textContent=t(error.message);save.disabled=false;close.disabled=false;delete dialog.dataset.saving;}
 });
 dialog.addEventListener('cancel',event=>{if(dialog.dataset.saving)event.preventDefault();});
 initLanguage();
 if(!restaurant){
  const status=document.querySelector('#status');status.textContent=t(requested?'Ресторан не найден или недоступен.':'Создай ресторан, чтобы начать.');
  document.querySelector('#menu-view').hidden=true;
  if(!requested)dialog.showModal();
  // Каталог не загружается, пока пользователь не выбрал доступное пространство.
  return new Promise(()=>{});
 }
 document.body.classList.toggle('read-only',restaurant.membership_role==='viewer');
 return {restaurant,apiPath:path=>path.replace('/api/','/api/restaurants/'+restaurant.id+'/'),preview:href=>href+'?restaurant='+restaurant.id};
}
