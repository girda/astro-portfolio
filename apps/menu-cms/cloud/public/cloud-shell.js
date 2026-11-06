const roles={viewer:'Просмотр',editor:'Редактор',super_admin:'Супер-админ'};
const states={pending:'Ожидает одобрения',active:'Доступ открыт',blocked:'Доступ заблокирован'};
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
async function api(path,options={}){const response=await fetch(path,{...options,headers:{'Content-Type':'application/json',...options.headers}});const data=await response.json();if(!response.ok)throw new Error(data.error||'Ошибка запроса');return data;}
function link(label,href){const a=el('a',label);a.href=href;return a;}
function profile(user){
 document.body.replaceChildren();const main=el('main');main.className='account-card';
 main.append(el('h1',user.name?'Мой профиль':'Заверши регистрацию'),el('p',user.email),el('p',`${states[user.status]} · ${roles[user.role]}`));
 main.append(el('p','Для работы CMS сохраняются имя, email, роль, статус и даты регистрации и входа. Эти данные доступны супер-администратору.'));
 if(user.status==='pending')main.append(el('p','Заполни имя. Администратор проверит заявку и назначит доступ к меню.'));
 const form=el('form'),label=el('label','Имя и фамилия'),input=el('input');input.name='name';input.autocomplete='name';input.required=true;input.minLength=2;input.maxLength=100;input.value=user.name;label.append(input);
 const button=el('button','Сохранить имя'),status=el('p');status.setAttribute('role','status');form.append(label,button,status);
 form.addEventListener('submit',async event=>{event.preventDefault();button.disabled=true;try{await api('/api/me',{method:'PUT',body:JSON.stringify({name:input.value})});status.textContent='Имя сохранено.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
 if(user.status!=='blocked')main.append(form);
 const links=el('nav');links.className='account-links';if(user.status==='active')links.append(link('Контент меню','/'));if(user.role==='super_admin'&&user.status==='active')links.append(link('Пользователи','/users.html'));links.append(link('Обновить статус','/account.html'),link('Выйти','/cdn-cgi/access/logout'));main.append(links);document.body.append(main);
}
try{
 const {user}=await api('/api/me');
 if(user.status!=='active'||location.pathname==='/account.html')profile(user);
 else if(location.pathname==='/users.html'){
  if(user.role!=='super_admin')throw new Error('Раздел доступен только супер-администратору.');
  const {initUsers}=await import('/users.js');await initUsers(user);
 }else{
  if(user.role==='viewer')document.body.classList.add('read-only');
  const nav=el('nav');nav.className='identity-links';nav.setAttribute('aria-label','Учётная запись');nav.append(link(user.name||user.email,'/account.html'));if(user.role==='super_admin')nav.append(link('Пользователи','/users.html'));nav.append(link('Выйти','/cdn-cgi/access/logout'));document.querySelector('.app-header').append(nav);
  await import('/admin.js');
 }
}catch(error){const main=el('main');main.className='account-card';main.append(el('h1','Вход в CMS'),el('p',error.message),link('Повторить вход','/cdn-cgi/access/logout'));document.body.replaceChildren(main);}
