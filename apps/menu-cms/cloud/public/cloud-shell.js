import {t,getLocale,initLanguage,applyLanguage} from './i18n.mjs';
initLanguage();
const roles={viewer:t('Просмотр'),editor:t('Редактор'),super_admin:t('Супер-админ')};
const states={pending:t('Ожидает одобрения'),active:t('Доступ открыт'),blocked:t('Доступ заблокирован')};
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
async function api(path,options={}){const response=await fetch(path,{...options,headers:{'Content-Type':'application/json',...options.headers}});const data=await response.json();if(!response.ok)throw new Error(data.error||t('Ошибка запроса'));return data;}
function link(label,href){const a=el('a',label);a.href=href;return a;}
function profile(user){
 document.body.replaceChildren();const main=el('main');main.className='account-card';
 main.append(el('h1',user.name?t('Мой профиль'):t('Заверши регистрацию')),el('p',user.email),el('p',`${states[user.status]} · ${roles[user.role]}`));
 main.append(el('p',t('Для работы CMS сохраняются имя, email, роль, статус и даты регистрации и входа. Эти данные доступны супер-администратору.')));
 if(user.status==='active'&&!user.name)main.append(el('p',t('Укажи имя, затем создай ресторан.')));
 if(user.status==='pending')main.append(el('p',t('Заполни имя. Администратор проверит заявку и назначит доступ к меню.')));
 const form=el('form'),label=el('label',t('Имя и фамилия')),input=el('input');input.name='name';input.autocomplete='name';input.required=true;input.minLength=2;input.maxLength=100;input.value=user.name;label.append(input);
 const button=el('button',t('Сохранить имя')),status=el('p');status.setAttribute('role','status');form.append(label,button,status);
 form.addEventListener('submit',async event=>{event.preventDefault();button.disabled=true;try{await api('/api/me',{method:'PUT',body:JSON.stringify({name:input.value})});status.textContent=t('Имя сохранено.');if(user.status==='active'&&!user.name)location.assign('/');}catch(error){status.textContent=t(error.message);}finally{button.disabled=false;}});
 if(user.status!=='blocked')main.append(form);
 const links=el('nav');links.className='account-links';if(user.status==='active')links.append(link(t('Контент меню'),'/'));if(user.role==='super_admin'&&user.status==='active')links.append(link(t('Пользователи'),'/users.html'));links.append(link(t('Обновить статус'),'/account.html'),link(t('Выйти'),'/cdn-cgi/access/logout'));main.append(links);document.body.append(main);initLanguage();
}
try{
 const {user}=await api('/api/me');
 if(user.status!=='active'||!user.name||location.pathname==='/account.html')profile(user);
 else if(location.pathname==='/users.html'){
  if(user.role!=='super_admin')throw new Error(t('Раздел доступен только супер-администратору.'));
  const {initUsers}=await import('/users.js');await initUsers(user);
 }else{
  document.querySelectorAll('[data-local-account],#local-account-dialog').forEach(node=>node.remove());
  const chip=link('', '/account.html');chip.className='account-chip';chip.setAttribute('aria-label',t('Мой профиль')+' · '+user.email);chip.title=user.email;
  chip.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/></svg>';
  const letter=el('span',user.email.slice(0,1).toUpperCase());letter.className='account-letter';chip.append(letter);document.querySelector('.app-nav').append(chip);
  if(user.role==='super_admin'){const usersLink=link(t('Пользователи'),'/users.html');usersLink.className='nav-item';document.querySelector('.app-nav>nav').append(usersLink);}
  await import('/admin.js');
 }
}catch(error){const main=el('main');main.className='account-card';main.append(el('h1',t('Вход в CMS')),el('p',error.message),link(t('Повторить вход'),'/cdn-cgi/access/logout'));document.body.replaceChildren(main);}
