import {t,getLocale,initLanguage,applyLanguage,allergenLabel} from './i18n.mjs';
import {MENU_APPEARANCES} from './menu-links.mjs';
import './qr-menu.js';
import {ALLERGENS,DEFAULT_SETTINGS,productOptions,allergenIconMarkup} from './menu-options.mjs';
import {mergeDraft, selectProducts} from './editor-state.mjs';

initLanguage();
const $ = selector => document.querySelector(selector);
const node = (tag,text,className) => {
  const element = document.createElement(tag);
  if(text !== undefined) element.textContent = text;
  if(className) element.className = className;
  return element;
};
const money = cents => new Intl.NumberFormat(getLocale(),{style:'currency',currency:'EUR'}).format(cents/100);
const imageLabels = {
  "chicken.webp": "Chicken & Cheddar",
  "beef.webp": "Classic Beef Burger",
  "double.webp": "Double Cheeseburger",
  "bbq.webp": "Smoky BBQ Burger",
  "crispy.webp": "Crispy Chicken",
  "chili.webp": "Chili Cheese Burger",
  "plate.webp": "Herzhaftes Frühstück",
  "brunch.webp": "Chicken Brunch",
  "morning.webp": "Morning Plate",
  "croissant.webp": "Buttercroissant",
  "almond.webp": "Mandelcroissant",
  "bakery-set.webp": "Croissant & Kaffee",
  "green.webp": "Green Lunch Bowl",
  "chicken-bowl.webp": "Chicken Bowl",
  "sweet.webp": "Süßkartoffel-Pommes",
  "fries.webp": "Pommes Frites",
  "loaded.webp": "Loaded Fries",
  "duo.webp": "Pommes-Duo",
  "coffee.webp": "Cappuccino",
  "latte.webp": "Iced Latte",
  "flat-white.webp": "Flat White",
  "filter.webp": "Filterkaffee",
  "oat.webp": "Oat Latte",
  "espresso.webp": "Espresso",
  "pizza-bufala.webp": "Margherita Bufala",
  "pizza-diavola.webp": "Diavola",
  "pizza-funghi.webp": "Funghi",
  "pizzeria-hero.webp": "Margherita",
  "caprese.webp": "Caprese",
  "tiramisu.webp": "Tiramisù"
};
const fieldLabels = {
  name:t('Название'), categoryId:t('Категория'), description:t('Описание'), price:t('Цена'),
  image:t('Фото'), allergens:t('Состав / аллергены'), time:t('Время'), sortOrder:t('Порядок'),
  showPrices:t('Отображение цен'),title:t('Заголовок'),subtitle:t('Подзаголовок'),logo:t('Логотип'),menuMode:t('Режим меню'),allergenIds:t('Аллергены'),allergensVerified:t('Состав проверен'),variants:t('Варианты порции и цены'),available:t('Доступность'), symbol:t('Значок'), active:t('Видимость категории'),
};
let state = null, selected = '', editing = null, busy = false, images = [];

const REQUEST_TIMEOUT_MS = 12000;
async function api(path,options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(),REQUEST_TIMEOUT_MS);
  try {
    let response;
    try {response = await fetch(path,{...options,signal:controller.signal});}
    catch {
      throw new Error(controller.signal.aborted ? t('CMS не ответила вовремя. Проверь сервер и повтори.') : t('Нет связи с локальной CMS. Проверь, запущен ли сервер.'));
    }
    let data;
    try {data = await response.json();}
    catch {throw new Error(t('Не удалось прочитать ответ CMS. Проверь соединение и повтори.'));}
    if(!response.ok) {
      const error = new Error(data.error || t('Не удалось выполнить запрос.'));
      error.status = response.status;
      throw error;
    }
    return data;
  } finally {clearTimeout(timer);}
}
function status(message,error = false) {
  $('#status').textContent = message;
  $('#status').classList.toggle('error',error);
}
function setBusy(value) {
  busy = value;
  document.querySelectorAll('[data-write]').forEach(button => button.disabled = value || !state);
  document.querySelectorAll('#fields input,#fields select,#fields textarea').forEach(input => input.disabled = value);
  $('#close-editor').disabled = value;
  $('#reload').disabled = value;
  $('#refresh-conflict').disabled = value;
}
async function load() {
  if(busy) return;
  setBusy(true);
  try {
    const [next,photos] = await Promise.all([api('/api/catalogue'),api('/api/images')]);
    state = next; images = photos;
    if(selected && !state.catalogue.categories.some(category => category.id === selected)) selected = '';
    render(); syncMenuSettings(); status(t('Данные загружены. Сохранение не публикует меню.'));
  } catch(error) {status(t(error.message),true);}
  finally {setBusy(false);}
}
function action(label,ariaLabel,handler) {
  const button = node('button',label,'secondary small');
  button.type = 'button'; button.dataset.write = ''; button.disabled = busy;
  button.setAttribute('aria-label',ariaLabel);
  button.addEventListener('click',handler);
  return button;
}
function focusProduct(id,selector = '[data-edit]') {
  requestAnimationFrame(() => {
    const target = document.querySelector(`[data-product-id="${CSS.escape(id)}"] ${selector}`) || $('#products-title');
    target.focus({preventScroll:true});
  });
}
async function toggleProduct(product) {
  if(busy) return;
  setBusy(true);
  try {
    state = await save('product',product,{...product,available:!product.available});
    render(); focusProduct(product.id,'[data-toggle]');
    const category = state.catalogue.categories.find(category => category.id === product.categoryId);
    status(product.available ? t('Продукт скрыт в черновике меню.') : category.active
      ? t('Продукт снова доступен в черновике меню.') : t('Продукт включён, но его категория пока скрыта.'));
  } catch(error) {status(t(error.message),true);}
  finally {setBusy(false);}
}
function render() {
  const {categories,products} = state.catalogue;
  const nav = $('#categories'); nav.replaceChildren();
  for(const category of [{id:'',name:t('Все продукты'),active:true},...categories]) {
    const button = node('button',undefined,'category'); button.type = 'button';
    if(category.id === selected) button.setAttribute('aria-current','page');
    button.append(node('span',category.name + (category.active ? '' : t(' · скрыта'))),
      node('span',String(products.filter(product => !category.id || product.categoryId === category.id).length),'badge'));
    button.addEventListener('click',() => {selected = category.id; render();}); nav.append(button);
  }
  const category = categories.find(category => category.id === selected);
  $('#products-title').textContent = category?.name || t('Все продукты');
  $('#edit-category').hidden = !category;
  const shown = selectProducts(state.catalogue,{
    categoryId:selected, query:$('#search').value,
    availability:$('#availability').value, sort:$('#sort').value,
  });
  const total = products.filter(product => !selected || product.categoryId === selected).length;
  $('#count').textContent = `${shown.length}${t(" из ")}${total}${t(" · Всего: ")}${products.length}`;
  const list = $('#products'); list.replaceChildren();
  for(const product of shown) {
    const category = categories.find(category => category.id === product.categoryId);
    const row = node('article',undefined,'product'); row.dataset.productId = product.id;
    const image = node('img'); image.src = '/assets/menu/' + product.image; image.alt = product.name;
    const info = node('div');
    info.append(node('h3',product.name),node('p',`${category.name} · ${product.available ? t('Включён') : t('Скрыт')}${category.active ? '' : t(' · категория скрыта')}`));
    const actions = node('div',undefined,'product-actions');
    const edit = action(t('Изменить'),`${t("Изменить ")}${product.name}`,() => open('product',product)); edit.dataset.edit = '';
    const toggle = action(product.available ? t('Скрыть') : t('Показать'),`${product.available ? t('Скрыть') : t('Показать')} ${product.name}`,() => toggleProduct(product));
    toggle.dataset.toggle = ''; toggle.setAttribute('aria-pressed',String(product.available));
    actions.append(node('strong',money(product.price),'price'),edit,toggle);
    row.append(image,info,actions); list.append(row);
  }
  if(!shown.length) {
    list.append(node('p',total ? t('По этим условиям ничего не найдено.') : t('В этой категории пока нет продуктов.'),'empty'));
    if($('#search').value || $('#availability').value !== 'all') {
      const reset = node('button',t('Сбросить поиск и фильтр'),'secondary small'); reset.type = 'button';
      reset.addEventListener('click',() => {$('#search').value = ''; $('#availability').value = 'all'; render(); $('#search').focus();});
      list.append(reset);
    }
  }
  $('#revision').textContent = `${t("Версия данных: ")}${state.revision}`;
}
function field(label,name,value,{type='text',wide=false,required=true,maxLength,options,min,max,step} = {}) {
  const wrapper = node('label',undefined,wide ? 'wide' : undefined);
  wrapper.append(node('span',label,'field-label'));
  let input;
  if(options) {
    input = node('select');
    for(const [value,text] of options) {const option = node('option',text); option.value = value; input.append(option);}
  } else if(type === 'textarea') input = node('textarea');
  else {input = node('input'); input.type = type;}
  input.name = name; input.required = required;
  if(maxLength) input.maxLength = maxLength;
  if(min !== undefined) input.min = min;
  if(max !== undefined) input.max = max;
  if(step !== undefined) input.step = step;
  if(type === 'checkbox') {input.checked = value; wrapper.className = 'checkbox wide'; wrapper.prepend(input);}
  else {input.value = value ?? ''; wrapper.append(input);}
  $('#fields').append(wrapper); return input;
}
function getValues() {
  const form = $('#edit-form');
  const valueOf = name => form.elements.namedItem(name)?.value;
  const checked = name => form.elements.namedItem(name)?.checked;
  const value = {name:valueOf('name'),sortOrder:Number(valueOf('sortOrder'))};
  if(editing.kind === 'category') Object.assign(value,{symbol:valueOf('symbol'),active:checked('active')});
  else {
    const [euros,fraction=''] = String(valueOf('price')).replace(',','.').split('.');
    Object.assign(value,{
      categoryId:valueOf('categoryId'), description:valueOf('description'),
      price:Number(euros)*100 + Number(fraction.padEnd(2,'0')), image:valueOf('image'),
      allergens:valueOf('allergens'),allergenIds:ALLERGENS.filter(a=>checked('allergen-'+a.id)).map(a=>a.id),allergensVerified:!!checked('allergensVerified'),variants:[...document.querySelectorAll('.variant-row')].map(row=>({label:row.querySelector('[data-variant-label]').value,price:Math.round(Number(row.querySelector('[data-variant-price]').value.replace(',','.'))*100)})), time:Number(valueOf('time')), available:checked('available'),
    });
  }
  return value;
}
const signature = () => JSON.stringify(getValues());
const dirty = () => editing && (busy || editing.copy || signature() !== editing.baseline);
function applyValues(values) {
  if(Array.isArray(values.allergenIds))for(const a of ALLERGENS){const input=$('#edit-form').elements.namedItem('allergen-'+a.id);if(input)input.checked=values.allergenIds.includes(a.id);}
  if(Array.isArray(values.variants)&&$('#variant-rows')){$('#variant-rows').replaceChildren();for(const variant of values.variants)appendVariant(variant);}

  for(const [key,value] of Object.entries(values)) {
    const input = $('#edit-form').elements.namedItem(key);
    if(!input) continue;
    if(input.type === 'checkbox') input.checked = value;
    else input.value = key === 'price' ? (value/100).toFixed(2) : value;
  }
  const image = $('#edit-form').elements.namedItem('image');
  if(image) $('#selected-photo').src = '/assets/menu/' + image.value;
}
function open(kind,record) {
  if(!state || busy) return;
  editing = {kind,record:record ? structuredClone(kind==='product'?{...record,...productOptions(record)}:record) : null};
  $('#edit-form').reset(); $('#fields').replaceChildren();
  $('#form-status').textContent = ''; $('#refresh-conflict').hidden = true;
  $('#editor-title').textContent=kind==='category'?(record?t('Изменить категорию'):t('Добавить категорию')):(record?t('Изменить продукт'):t('Добавить продукт'));
  const row = record || {};
  field(t('Название'),'name',row.name,{wide:true,maxLength:kind === 'category' ? 100 : 160});
  if(kind === 'category') {
    field(t('Значок меню'),'symbol',row.symbol || '🍽️',{maxLength:24});
    field(t('Порядок показа'),'sortOrder',row.sortOrder ?? Math.max(-1,...state.catalogue.categories.map(c => c.sortOrder))+1,{type:'number',min:0,max:100000,step:1});
    field(t('Показывать категорию и её продукты в меню'),'active',row.active ?? true,{type:'checkbox',required:false});
  } else {
    field(t('Категория'),'categoryId',row.categoryId || selected || state.catalogue.categories[0]?.id,{options:state.catalogue.categories.map(c => [c.id,c.name + (c.active ? '' : t(' · скрыта'))])});
    const price = field(t('Цена, €'),'price',row.price === undefined ? '' : (row.price/100).toFixed(2));
    price.inputMode = 'decimal'; price.pattern = '[0-9]+([.,][0-9]{1,2})?'; price.placeholder = '11.90';
    field(t('Описание'),'description',row.description,{type:'textarea',wide:true,maxLength:3000});
    const image = field(t('Фото из локальной библиотеки'),'image',row.image || images[0],{options:images.map(name => [name,imageLabels[name] || name])});
    const preview = node('img'); preview.id = 'selected-photo'; preview.alt = t('Выбранное фото продукта'); preview.src = '/assets/menu/' + image.value; preview.className = 'wide';
    $('#fields').append(preview); image.addEventListener('change',() => preview.src = '/assets/menu/' + image.value);
    field(t('Состав / примерные аллергены'),'allergens',row.allergens,{type:'textarea',wide:true,maxLength:1000});
    const options=productOptions(row);
    const allergens=node('fieldset',undefined,'allergen-editor wide');allergens.append(node('legend',t('Аллергены')));
    for(const allergen of ALLERGENS){const label=node('label',undefined,'allergen-choice');const input=node('input');input.type='checkbox';input.name='allergen-'+allergen.id;input.checked=options.allergenIds.includes(allergen.id);const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.innerHTML=allergenIconMarkup(allergen);label.title=allergenLabel(allergen.id);input.setAttribute('aria-label',allergenLabel(allergen.id));label.append(input,icon,node('span',allergenLabel(allergen.id)));allergens.append(label);}
    $('#fields').append(allergens);
    field(t('Состав и аллергены проверены владельцем'),'allergensVerified',options.allergensVerified,{type:'checkbox',required:false});
    const variants=node('fieldset',undefined,'wide');variants.id='variant-editor';variants.append(node('legend',t('Варианты порции и цены')),node('p',t('Например: котлета 80 г / 150 г. Если вариантов нет, используется основная цена.'),'muted'));
    const list=node('div');list.id='variant-rows';variants.append(list);const add=node('button',t('Добавить вариант'),'secondary');add.type='button';add.addEventListener('click',()=>{if(list.children.length<6)appendVariant({label:'',price:row.price??0});});variants.append(add);$('#fields').append(variants);
    for(const variant of options.variants)appendVariant(variant);
    field(t('Приготовление, минут'),'time',row.time ?? 15,{type:'number',min:0,max:1440,step:1});
    field(t('Порядок показа'),'sortOrder',row.sortOrder ?? Math.max(-1,...state.catalogue.products.map(p => p.sortOrder))+1,{type:'number',min:0,max:100000,step:1});
    field(t('Продукт доступен в меню'),'available',row.available ?? true,{type:'checkbox',required:false});
  }
  editing.baseline = signature(); $('#editor').showModal();
}
function appendVariant(variant){
 const row=node('div',undefined,'variant-row');const label=node('input');label.dataset.variantLabel='';label.placeholder=t('Например, 80 г');label.maxLength=40;label.required=true;label.setAttribute('aria-label',t('Название / граммовка варианта'));label.value=variant.label;
 const price=node('input');price.dataset.variantPrice='';price.inputMode='decimal';price.required=true;price.pattern='[0-9]+([.,][0-9]{1,2})?';price.setAttribute('aria-label',t('Цена варианта в евро'));price.value=(variant.price/100).toFixed(2);
 const remove=node('button',t('Удалить'),'secondary small');remove.type='button';remove.addEventListener('click',()=>row.remove());row.append(label,price,remove);$('#variant-rows').append(row);
}
function save(kind,record,value) {
  return api(`/api/${kind === 'category' ? 'categories' : 'products'}${record ? '/' + record.id : ''}`,{
    method:record ? 'PUT' : 'POST',
    headers:{'Content-Type':'application/json','If-Match':String(state.revision)},
    body:JSON.stringify(value),
  });
}
function requestClose() {
  if(busy) return;
  if(dirty()) { $('#discard-dialog').showModal(); return; }
  $('#editor').close();
}
$('#edit-form').addEventListener('submit',async event => {
  event.preventDefault();
  if(busy || !event.currentTarget.reportValidity()) return;
  const {kind,record} = editing, value = getValues(), collection = kind === 'category' ? 'categories' : 'products';
  const oldIds = new Set(state.catalogue[collection].map(row => row.id));
  setBusy(true); $('#form-status').textContent = t('Сохранение…');
  try {
    state = await save(kind,record,value);
    const saved = state.catalogue[collection].find(row => record ? row.id === record.id : !oldIds.has(row.id));
    selected = kind === 'category' ? saved.id : saved.categoryId;
    $('#search').value = ''; $('#availability').value = 'all';
    $('#editor').close(); render();
    if(kind === 'product') focusProduct(saved.id);
    else $('#edit-category').focus({preventScroll:true});
    status(t('Черновик сохранён. Обнови предпросмотр, чтобы увидеть изменения.'));
  } catch(error) {
    $('#form-status').textContent = t(error.message);
    $('#refresh-conflict').hidden = error.status !== 409;
  } finally {setBusy(false);}
});
$('#refresh-conflict').addEventListener('click',async () => {
  if(busy || !editing) return;
  const draft = getValues(); setBusy(true);
  try {
    const next = await api('/api/catalogue');
    const collection = editing.kind === 'category' ? 'categories' : 'products';
    const categorySelect = $('#edit-form').elements.namedItem('categoryId');
    if(categorySelect) {
      for(const option of categorySelect.options) {
        const category = next.catalogue.categories.find(category => category.id === option.value);
        if(category) option.textContent = category.name + (category.active ? '' : t(' · скрыта'));
      }
    }
    if(editing.record) {
      const latest = next.catalogue[collection].find(row => row.id === editing.record.id);
      if(!latest) throw new Error(t('Эта запись больше недоступна. Черновик остался в редакторе.'));
      const merged = mergeDraft(editing.record,draft,latest);
      editing.record = structuredClone(latest);
      applyValues(latest); editing.baseline = signature(); applyValues(merged.values);
      $('#form-status').textContent = merged.conflicts.length
        ? `${t("Обе вкладки изменили: ")}${merged.conflicts.map(key => fieldLabels[key] || key).join(', ')}${t(". В редакторе оставлены твои значения этих полей. Проверь их перед сохранением.")}`
        : t('Актуальная версия загружена. Твой черновик сохранён, независимые изменения другой вкладки добавлены. Проверь и сохрани.');
    } else $('#form-status').textContent = t('Данные обновлены, новый черновик сохранён. Можно повторить сохранение.');
    state = next; render(); $('#refresh-conflict').hidden = true;
  } catch(error) {$('#form-status').textContent = t(error.message);}
  finally {setBusy(false);}
});
$('#new-category').addEventListener('click',() => open('category'));
$('#new-product').addEventListener('click',() => {
  if(!state.catalogue.categories.length) return status(t('Сначала добавь категорию.'),true);
  open('product');
});
$('#edit-category').addEventListener('click',() => open('category',state.catalogue.categories.find(category => category.id === selected)));
$('#close-editor').addEventListener('click',requestClose);
$('#editor').addEventListener('cancel',event => {event.preventDefault(); requestClose();});
$('#editor').addEventListener('close',() => {editing = null;});
window.addEventListener('beforeunload',event => {if(dirty()) {event.preventDefault(); event.returnValue = '';}});
for(const selector of ['#search','#availability','#sort']) $(selector).addEventListener('input',() => {if(state) render();});
$('#reload').addEventListener('click',load);
load();

// Журнал загружается только при открытии раздела и не меняет черновик меню.
let historyPage=1,historyAnchor=null,historyPages=1,historyRequest=0;
const historyDate = new Intl.DateTimeFormat(getLocale(),{dateStyle:'medium',timeStyle:'short'});
function historyValue(key,value) {
  if(value === null || value === undefined || value === '') return '—';
  if(typeof value === 'boolean') return value ? t('Да') : t('Нет');
  if(key === 'price') return money(value);
  if(key === 'logo')return value?t('Свой логотип'):t('Стандартный логотип');
  if(key === 'menuMode')return value==='informational'?t('Информационное меню'):t('Демонстрация заказа');
  if(key === 'variants')return value.map(v=>`${v.label}: ${money(v.price)}`).join(' · ')||t('Основная цена');
  if(key === 'allergenIds')return value.map(id=>allergenLabel(id)).join(', ')||t('Не отмечены');
  if(key === 'image') return imageLabels[value] || value;
  if(key === 'categoryId') return state?.catalogue.categories.find(category => category.id === value)?.name || value;
  return String(value);
}
async function loadHistory(reset=true){
 const request=++historyRequest;if(reset){historyPage=1;historyAnchor=null;}
 $('#history-prev').disabled=true;$('#history-next').disabled=true;$('#reload-history').disabled=true;$('#history-status').textContent=t('Загрузка истории…');
 const params=new URLSearchParams(new FormData($('#history-filters')));params.set('page',String(historyPage));if(historyAnchor)params.set('anchor',String(historyAnchor));
 try{
  const data=await api('/api/history/query?'+params);if(request!==historyRequest)return;
  historyPage=data.page;historyPages=data.pages;historyAnchor=data.anchor;$('#history-list').replaceChildren();
    for(const entry of data.entries) {
      const details = node('details',undefined,'history-entry');
      const summary = node('summary');
      const kindLabel=entry.kind==='categories'?t('Категория'):entry.kind==='settings'?t('Оформление меню'):t('Продукт');
      summary.append(node('strong',`${entry.after.name||entry.after.title||t('Оформление меню')} · ${kindLabel} · ${entry.action==='create'?t('Создана'):t('Изменена')}`));
      summary.append(node('span',`${historyDate.format(new Date(entry.createdAt))}${t(" · Версия ")}${entry.revision} · ${entry.actor?.name || t('Локальная CMS')}`,'history-meta'));
      const changes = node('dl',undefined,'history-changes');
      for(const key of Object.keys(entry.after)) {
        if(key === 'id' || JSON.stringify(entry.before?.[key]) === JSON.stringify(entry.after[key])) continue;
        const row = node('div',undefined,'change-row');
        row.append(node('dt',fieldLabels[key] || key));
        for(const [caption,value] of [[t('Было'),entry.before?.[key]],[t('Стало'),entry.after[key]]]) {
          const cell = node('dd'); cell.append(node('small',caption),node('span',historyValue(key,value))); row.append(cell);
        }
        changes.append(row);
      }
      if(!changes.children.length) changes.append(node('p',t('Сохранено без изменения значений.'),'muted'));
      details.append(summary,changes); $('#history-list').append(details);
    }

  $('#history-page').textContent=`${t("Страница ")}${data.page}${t(" из ")}${data.pages}${t(" · Всего: ")}${data.total}`;
  $('#history-prev').disabled=data.page<=1;$('#history-next').disabled=data.page>=data.pages;
  $('#history-status').textContent=data.total?`${t("Найдено записей: ")}${data.total}`:t('По этим условиям ничего не найдено.');
 }catch(error){if(request===historyRequest)$('#history-status').textContent=t(error.message);}
 finally{if(request===historyRequest)$('#reload-history').disabled=false;}
}
const views={menu:[t('Управление меню'),t('Контент'),'products-title'],history:[t('История изменений'),t('История'),'history-title'],preview:[t('Предпросмотр меню'),t('Предпросмотр'),'preview-title'],qr:[t('QR-код меню'),t('QR-меню'),'qr-title']};
function showView(name) {
  try{sessionStorage.setItem('my-menu:view',name);}catch{}
  for(const id of Object.keys(views)){
    $('#'+id+'-view').hidden=id!==name;
    const button=$('#show-'+id);
    if(id===name)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  }
  const [title,section,target]=views[name];
  $('#page-title').textContent=title;$('.skip-link').href='#'+target;
  if(name==='history')void loadHistory();
  window.scrollTo({top:0,behavior:'instant'});
}
for(const name of Object.keys(views))$('#show-'+name).addEventListener('click',()=>showView(name));
const appearances=MENU_APPEARANCES;
let appearance='streetfood';
try{const saved=localStorage.getItem('my-menu:appearance');if(appearances.some(item=>item.id===saved))appearance=saved;}catch{}
function syncAppearance(){
  for(const button of document.querySelectorAll('[data-appearance-select]')){
    const selected=button.dataset.appearanceSelect===appearance;
    button.setAttribute('aria-pressed',String(selected));button.textContent=selected?t('Выбрано'):t('Выбрать оформление');
  }
}
for(const item of appearances){
  const card=node('article',undefined,'appearance-card');
  const image=document.createElement('img');image.src='/appearance-previews/'+item.id+'.png';image.alt=t('Первый экран меню ')+item.name;image.width=640;image.height=460;image.loading='lazy';
  const body=node('div',undefined,'appearance-body');body.append(node('h3',item.name),node('p',t(item.description)));
  const actions=node('div',undefined,'appearance-actions');const select=node('button',t('Выбрать оформление'));select.dataset.appearanceSelect=item.id;
  select.addEventListener('click',()=>{appearance=item.id;try{localStorage.setItem('my-menu:appearance',appearance);}catch{}syncAppearance();$('#appearance-status').textContent=t('Выбрано: ')+item.name+'.';});
  const open=node('a',t('Открыть меню'),'secondary');open.href='/preview/'+item.path;open.target='_blank';open.rel='noopener';
  actions.append(select,open);body.append(actions);card.append(image,body);$('#appearance-grid').append(card);
}
syncAppearance();
$('#reload-history').addEventListener('click',() => loadHistory());
$('#history-prev').addEventListener('click',()=>{if(historyPage>1){historyPage--;void loadHistory(false);}});
$('#history-next').addEventListener('click',()=>{if(historyPage<historyPages){historyPage++;void loadHistory(false);}});
let historyTimer;$('#history-filters').addEventListener('input',()=>{clearTimeout(historyTimer);historyTimer=setTimeout(()=>loadHistory(),200);});
$('#history-filters').addEventListener('submit',event=>{event.preventDefault();clearTimeout(historyTimer);void loadHistory();});
$('#history-filters').addEventListener('reset',()=>setTimeout(()=>loadHistory(),0));

$('#keep-editing').addEventListener('click',() => $('#discard-dialog').close());
$('#discard-changes').addEventListener('click',() => {$('#discard-dialog').close(); $('#editor').close();});

let menuLogo='';
function syncMenuSettings(){
 const settings={...DEFAULT_SETTINGS,...state?.catalogue.settings};const form=$('#menu-settings');
 for(const key of ['title','subtitle','menuMode','showPrices'])form.elements.namedItem(key).value=settings[key];menuLogo=settings.logo;syncLogoPreview();settingsBaseline=settingsSignature();
}
function syncLogoPreview(){const image=$('#menu-logo-preview');image.hidden=!menuLogo;if(menuLogo)image.src=menuLogo;else image.removeAttribute('src');}
$('#clear-menu-logo').addEventListener('click',()=>{menuLogo='';syncLogoPreview();$('#menu-logo-upload').value='';});
$('#menu-logo-upload').addEventListener('change',async event=>{
 const file=event.target.files[0];if(!file)return;
 try{
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5000000)throw new Error(t('Выбери PNG, JPEG или WebP до 5 МБ.'));
  const bitmap=await createImageBitmap(file);const factor=Math.min(1,700/bitmap.width,240/bitmap.height);const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*factor));canvas.height=Math.max(1,Math.round(bitmap.height*factor));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const data=canvas.toDataURL('image/webp',.8);if(data.length>45000)throw new Error(t('Логотип слишком сложный. Выбери более простое или меньшее изображение.'));menuLogo=data;syncLogoPreview();$('#settings-status').textContent=t('Логотип подготовлен. Сохрани оформление.');
 }catch(error){$('#settings-status').textContent=t(error.message);event.target.value='';}
});
$('#menu-settings').addEventListener('submit',async event=>{
 event.preventDefault();if(busy||!state||!event.target.reportValidity())return;const form=event.target;
 setBusy(true);try{state=await api('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json','If-Match':String(state.revision)},body:JSON.stringify({title:form.elements.namedItem('title').value,subtitle:form.elements.namedItem('subtitle').value,menuMode:form.elements.namedItem('menuMode').value,showPrices:form.elements.namedItem('showPrices').value==='true',logo:menuLogo})});settingsBaseline=settingsSignature();$('#settings-status').textContent=t('Оформление сохранено. Обнови меню.');}catch(error){$('#settings-status').textContent=t(error.message);}finally{setBusy(false);}
});

const accountDialog=document.querySelector('#local-account-dialog');
document.querySelectorAll('[data-local-account]').forEach(button=>button.addEventListener('click',()=>accountDialog.showModal()));
document.querySelector('[data-account-close]')?.addEventListener('click',()=>accountDialog.close());

let settingsBaseline='',pendingLanguage=null;
document.addEventListener('cms-language-request',event=>{
 if((editing&&$('#editor').open&&signature()!==editing.baseline)||(settingsBaseline&&settingsSignature()!==settingsBaseline)){event.preventDefault();pendingLanguage=event.detail;$('#discard-dialog').showModal();}
});
$('#keep-editing').addEventListener('click',()=>{pendingLanguage=null;});
$('#discard-changes').addEventListener('click',()=>{if(pendingLanguage)applyLanguage(pendingLanguage);});


const settingsSignature=()=>JSON.stringify([...new FormData($('#menu-settings'))].filter(([key])=>key!=='menu-logo-upload'))+menuLogo;
$('#menu-settings').addEventListener('input',()=>{if(!settingsBaseline)settingsBaseline=settingsSignature();},{once:true});
try{const savedView=sessionStorage.getItem('my-menu:view');if(Object.hasOwn(views,savedView))showView(savedView);}catch{}
