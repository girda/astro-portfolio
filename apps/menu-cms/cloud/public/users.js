export async function initUsers(actor){
 const list=document.querySelector('#user-list'),status=document.querySelector('#user-status'),more=document.querySelector('#more-users'),search=document.querySelector('#user-search');let users=[],cursor='';
 const roles={viewer:'Просмотр',editor:'Редактор',super_admin:'Супер-админ'},states={pending:'Ожидает одобрения',active:'Одобрен',blocked:'Заблокирован'};
 const node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el};
 const date=value=>value?new Intl.DateTimeFormat('ru',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'Ещё не входил';
 function select(label,values,value){const wrap=node('label',label),input=node('select');for(const [key,text]of Object.entries(values)){const option=node('option',text);option.value=key;input.append(option)}input.value=value;wrap.append(input);return {wrap,input};}
 function render(){list.replaceChildren();const term=search.value.trim().toLowerCase();for(const user of users.filter(u=>(u.name+' '+u.email).toLowerCase().includes(term))){
  const card=node('article');card.className='user-card';card.append(node('h2',user.name||'Имя не заполнено'));const email=node('p',user.email);email.className='user-email';card.append(email);
  const meta=node('div');meta.className='user-meta';meta.append(node('span','Регистрация: '+date(user.createdAt)),node('span','Последний вход: '+date(user.lastLoginAt)));card.append(meta);
  if(user.id===actor.id||user.id==='owner-artem-hirda'){card.append(node('p',roles[user.role]+' · '+states[user.status]));}
  else{const form=node('form');form.className='user-controls';const role=select('Роль',roles,user.role),state=select('Статус',states,user.status),save=node('button','Сохранить доступ');form.append(role.wrap,state.wrap,save);form.addEventListener('submit',async event=>{event.preventDefault();save.disabled=true;try{const response=await fetch('/api/users/'+encodeURIComponent(user.id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:role.input.value,status:state.input.value,revision:user.revision})});const result=await response.json();if(!response.ok)throw new Error(result.error);users=users.map(u=>u.id===user.id?result.user:u);status.textContent='Доступ обновлён.';render();}catch(error){status.textContent=error.message;}finally{save.disabled=false;}});card.append(form);}
  list.append(card);
 }}
 async function load(){more.disabled=true;try{const response=await fetch('/api/users?after='+encodeURIComponent(cursor));const data=await response.json();if(!response.ok)throw new Error(data.error);users.push(...data.users);cursor=data.nextAfter;more.hidden=!cursor;render();status.textContent=`Загружено пользователей: ${users.length}`;}catch(error){status.textContent=error.message;}finally{more.disabled=false;}}
 search.addEventListener('input',render);more.addEventListener('click',load);await load();
}
