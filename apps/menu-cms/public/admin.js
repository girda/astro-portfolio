const $=s=>document.querySelector(s);
const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
let state=null,selected='',editing=null,busy=false,images=[];
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n/100);
async function api(path,options={}){const response=await fetch(path,options);const data=await response.json();if(!response.ok)throw new Error(data.error||'Не удалось выполнить запрос.');return data;}
function status(message,error=false){$('#status').textContent=message;$('#status').classList.toggle('error',error);}
async function load(){try{const [next,photos]=await Promise.all([api('/api/catalogue'),api('/api/images')]);state=next;images=photos;render();status('Данные загружены. Сохранение не публикует меню.');$('#new-category').disabled=false;$('#new-product').disabled=false;}catch(error){status(error.message,true);}}
function render(){
 const {categories,products}=state.catalogue;
 const nav=$('#categories');nav.replaceChildren();
 for(const category of [{id:'',name:'Все продукты',active:true},...categories]){
  const button=node('button',undefined,'category');button.type='button';if(category.id===selected)button.setAttribute('aria-current','page');
  const text=node('span',category.name+(category.active?'':' · скрыта'));const count=node('span',String(products.filter(p=>!category.id||p.categoryId===category.id).length),'badge');button.append(text,count);
  button.addEventListener('click',()=>{selected=category.id;render()});nav.append(button);
 }
 $('#products-title').textContent=categories.find(c=>c.id===selected)?.name||'Все продукты';$('#edit-category').hidden=!selected;
 const query=$('#search').value.trim().toLocaleLowerCase('ru');const shown=products.filter(p=>(!selected||p.categoryId===selected)&&`${p.name} ${p.description}`.toLocaleLowerCase('ru').includes(query));
 $('#count').textContent=`${shown.length} из ${products.length} продуктов`;
 const list=$('#products');list.replaceChildren();
 for(const p of shown){const category=categories.find(c=>c.id===p.categoryId);const row=node('article',undefined,'product');const image=node('img');image.src='/assets/menu/'+p.image;image.alt=p.name;
  const info=node('div');info.append(node('h3',p.name),node('p',`${category.name} · ${p.available?'Доступен':'Скрыт'}${category.active?'':' · категория скрыта'}`));
  const actions=node('div',undefined,'product-actions');const edit=node('button','Изменить','secondary small');edit.type='button';edit.setAttribute('aria-label',`Изменить ${p.name}`);edit.addEventListener('click',()=>open('product',p));actions.append(node('strong',money(p.price),'price'),edit);row.append(image,info,actions);list.append(row);
 }
 if(!shown.length)list.append(node('p','Здесь пока нет продуктов. Добавь первый или измени поиск.','empty'));
 $('#revision').textContent=`Версия данных: ${state.revision}`;
}
function field(label,name,value,{type='text',wide=false,required=true,maxLength,options,min,max,step}={}){
 const wrapper=node('label',label,wide?'wide':undefined);let input;
 if(options){input=node('select');for(const [value,text]of options){const option=node('option',text);option.value=value;input.append(option)}}
 else if(type==='textarea')input=node('textarea');else{input=node('input');input.type=type;}
 input.name=name;input.required=required;if(maxLength)input.maxLength=maxLength;if(min!==undefined)input.min=min;if(max!==undefined)input.max=max;if(step!==undefined)input.step=step;
 if(type==='checkbox'){input.checked=value;wrapper.className='checkbox wide';wrapper.prepend(input);}else{input.value=value??'';wrapper.append(input)}
 $('#fields').append(wrapper);return input;
}
function open(kind,record){
 if(!state||busy)return;
 editing={kind,record};$('#edit-form').reset();$('#fields').replaceChildren();$('#form-status').textContent='';
 $('#editor-title').textContent=`${record?'Изменить':'Добавить'} ${kind==='category'?'категорию':'продукт'}`;
 const row=record||{};field('Название','name',row.name,{wide:true,maxLength:kind==='category'?100:160});
 if(kind==='category'){
  field('Значок меню','symbol',row.symbol||'🍽️',{maxLength:24});field('Порядок показа','sortOrder',row.sortOrder??state.catalogue.categories.length,{type:'number',min:0,max:100000,step:1});field('Показывать категорию и её продукты в меню','active',row.active??true,{type:'checkbox',required:false});
 }else{
  field('Категория','categoryId',row.categoryId||selected||state.catalogue.categories[0]?.id,{options:state.catalogue.categories.map(c=>[c.id,c.name+(c.active?'':' · скрыта')])});
  const price=field('Цена, €','price',row.price===undefined?'':(row.price/100).toFixed(2));price.inputMode='decimal';price.pattern='[0-9]+([.,][0-9]{1,2})?';price.placeholder='11.90';
  field('Описание','description',row.description,{type:'textarea',wide:true,maxLength:3000});
  const image=field('Фото из локальной библиотеки','image',row.image||images[0],{options:images.map(name=>[name,name])});const preview=node('img');preview.alt='Выбранное фото продукта';preview.src='/assets/menu/'+image.value;preview.className='wide';$('#fields').append(preview);image.addEventListener('change',()=>preview.src='/assets/menu/'+image.value);
  field('Состав / примерные аллергены','allergens',row.allergens,{type:'textarea',wide:true,maxLength:1000});field('Приготовление, минут','time',row.time??15,{type:'number',min:0,max:1440,step:1});field('Порядок показа','sortOrder',row.sortOrder??state.catalogue.products.length,{type:'number',min:0,max:100000,step:1});field('Продукт доступен в меню','available',row.available??true,{type:'checkbox',required:false});
 }
 $('#editor').showModal();
}
$('#edit-form').addEventListener('submit',async event=>{
 event.preventDefault();if(busy||!event.currentTarget.reportValidity())return;
 const form=event.currentTarget,data=new FormData(form),{kind,record}=editing;
 const value={name:data.get('name'),sortOrder:Number(data.get('sortOrder'))};
 if(kind==='category'){value.symbol=data.get('symbol');value.active=data.has('active');}
 else{const [euros,fraction='']=String(data.get('price')).replace(',','.').split('.');Object.assign(value,{categoryId:data.get('categoryId'),description:data.get('description'),price:Number(euros)*100+Number(fraction.padEnd(2,'0')),image:data.get('image'),allergens:data.get('allergens'),time:Number(data.get('time')),available:data.has('available')});}
 busy=true;const submit=form.querySelector('[type=submit]');submit.disabled=true;$('#form-status').textContent='Сохранение…';
 try{state=await api(`/api/${kind==='category'?'categories':'products'}${record?'/'+record.id:''}`,{method:record?'PUT':'POST',headers:{'Content-Type':'application/json','If-Match':String(state.revision)},body:JSON.stringify(value)});$('#editor').close();render();status('Сохранено локально. Открой или обнови предпросмотр, чтобы увидеть изменения.');}
 catch(error){$('#form-status').textContent=error.message;}
 finally{busy=false;submit.disabled=false;}
});
$('#new-category').addEventListener('click',()=>open('category'));
$('#new-product').addEventListener('click',()=>{if(!state.catalogue.categories.length)return status('Сначала добавь категорию.',true);open('product')});
$('#edit-category').addEventListener('click',()=>open('category',state.catalogue.categories.find(c=>c.id===selected)));
$('#close-editor').addEventListener('click',()=>{if(!busy)$('#editor').close()});
$('#editor').addEventListener('cancel',event=>{if(busy)event.preventDefault()});
$('#search').addEventListener('input',()=>{if(state)render()});$('#reload').addEventListener('click',()=>load());
load();
