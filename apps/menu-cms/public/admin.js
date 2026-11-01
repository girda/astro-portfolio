import {mergeDraft, selectProducts} from './editor-state.mjs';

const $ = selector => document.querySelector(selector);
const node = (tag,text,className) => {
  const element = document.createElement(tag);
  if(text !== undefined) element.textContent = text;
  if(className) element.className = className;
  return element;
};
const money = cents => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(cents/100);
const imageLabels = {
  'chicken.webp':'Бургер с курицей', 'beef.webp':'Говяжий бургер',
  'double.webp':'Двойной бургер', 'plate.webp':'Горячее блюдо',
  'sweet.webp':'Батат фри', 'fries.webp':'Картофель фри',
  'croissant.webp':'Круассан', 'coffee.webp':'Кофе',
};
const fieldLabels = {
  name:'Название', categoryId:'Категория', description:'Описание', price:'Цена',
  image:'Фото', allergens:'Состав / аллергены', time:'Время', sortOrder:'Порядок',
  available:'Доступность', symbol:'Значок', active:'Видимость категории',
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
      throw new Error(controller.signal.aborted ? 'CMS не ответила вовремя. Проверь сервер и повтори.' : 'Нет связи с локальной CMS. Проверь, запущен ли сервер.');
    }
    let data;
    try {data = await response.json();}
    catch {throw new Error('Не удалось прочитать ответ CMS. Проверь соединение и повтори.');}
    if(!response.ok) {
      const error = new Error(data.error || 'Не удалось выполнить запрос.');
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
    render(); status('Данные загружены. Сохранение не публикует меню.');
  } catch(error) {status(error.message,true);}
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
    status(product.available ? 'Продукт скрыт в локальном меню.' : category.active
      ? 'Продукт снова доступен в локальном меню.' : 'Продукт включён, но его категория пока скрыта.');
  } catch(error) {status(error.message,true);}
  finally {setBusy(false);}
}
function render() {
  const {categories,products} = state.catalogue;
  const nav = $('#categories'); nav.replaceChildren();
  for(const category of [{id:'',name:'Все продукты',active:true},...categories]) {
    const button = node('button',undefined,'category'); button.type = 'button';
    if(category.id === selected) button.setAttribute('aria-current','page');
    button.append(node('span',category.name + (category.active ? '' : ' · скрыта')),
      node('span',String(products.filter(product => !category.id || product.categoryId === category.id).length),'badge'));
    button.addEventListener('click',() => {selected = category.id; render();}); nav.append(button);
  }
  const category = categories.find(category => category.id === selected);
  $('#products-title').textContent = category?.name || 'Все продукты';
  $('#edit-category').hidden = !category;
  const shown = selectProducts(state.catalogue,{
    categoryId:selected, query:$('#search').value,
    availability:$('#availability').value, sort:$('#sort').value,
  });
  const total = products.filter(product => !selected || product.categoryId === selected).length;
  $('#count').textContent = `Показано: ${shown.length} из ${total}. Всего в каталоге: ${products.length}.`;
  const list = $('#products'); list.replaceChildren();
  for(const product of shown) {
    const category = categories.find(category => category.id === product.categoryId);
    const row = node('article',undefined,'product'); row.dataset.productId = product.id;
    const image = node('img'); image.src = '/assets/menu/' + product.image; image.alt = product.name;
    const info = node('div');
    info.append(node('h3',product.name),node('p',`${category.name} · ${product.available ? 'Включён' : 'Скрыт'}${category.active ? '' : ' · категория скрыта'}`));
    const actions = node('div',undefined,'product-actions');
    const edit = action('Изменить',`Изменить ${product.name}`,() => open('product',product)); edit.dataset.edit = '';
    const copy = action('Копия',`Создать копию ${product.name}`,() => open('product',null,product));
    const toggle = action(product.available ? 'Скрыть' : 'Показать',`${product.available ? 'Скрыть' : 'Показать'} ${product.name}`,() => toggleProduct(product));
    toggle.dataset.toggle = ''; toggle.setAttribute('aria-pressed',String(product.available));
    actions.append(node('strong',money(product.price),'price'),edit,copy,toggle);
    row.append(image,info,actions); list.append(row);
  }
  if(!shown.length) {
    list.append(node('p',total ? 'По этим условиям ничего не найдено.' : 'В этой категории пока нет продуктов.','empty'));
    if($('#search').value || $('#availability').value !== 'all') {
      const reset = node('button','Сбросить поиск и фильтр','secondary small'); reset.type = 'button';
      reset.addEventListener('click',() => {$('#search').value = ''; $('#availability').value = 'all'; render(); $('#search').focus();});
      list.append(reset);
    }
  }
  $('#revision').textContent = `Версия данных: ${state.revision}`;
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
      allergens:valueOf('allergens'), time:Number(valueOf('time')), available:checked('available'),
    });
  }
  return value;
}
const signature = () => JSON.stringify(getValues());
const dirty = () => editing && (busy || editing.copy || signature() !== editing.baseline);
function applyValues(values) {
  for(const [key,value] of Object.entries(values)) {
    const input = $('#edit-form').elements.namedItem(key);
    if(!input) continue;
    if(input.type === 'checkbox') input.checked = value;
    else input.value = key === 'price' ? (value/100).toFixed(2) : value;
  }
  const image = $('#edit-form').elements.namedItem('image');
  if(image) $('#selected-photo').src = '/assets/menu/' + image.value;
}
function open(kind,record,copy) {
  if(!state || busy) return;
  editing = {kind,record:record ? structuredClone(record) : null,copy:!!copy};
  $('#edit-form').reset(); $('#fields').replaceChildren();
  $('#form-status').textContent = ''; $('#refresh-conflict').hidden = true;
  $('#editor-title').textContent = copy ? 'Копия продукта' : `${record ? 'Изменить' : 'Добавить'} ${kind === 'category' ? 'категорию' : 'продукт'}`;
  const row = record || (copy ? {...copy,name:copy.name.slice(0,151) + ' (Kopie)',sortOrder:Math.max(-1,...state.catalogue.products.map(p => p.sortOrder))+1} : {});
  field('Название','name',row.name,{wide:true,maxLength:kind === 'category' ? 100 : 160});
  if(kind === 'category') {
    field('Значок меню','symbol',row.symbol || '🍽️',{maxLength:24});
    field('Порядок показа','sortOrder',row.sortOrder ?? Math.max(-1,...state.catalogue.categories.map(c => c.sortOrder))+1,{type:'number',min:0,max:100000,step:1});
    field('Показывать категорию и её продукты в меню','active',row.active ?? true,{type:'checkbox',required:false});
  } else {
    field('Категория','categoryId',row.categoryId || selected || state.catalogue.categories[0]?.id,{options:state.catalogue.categories.map(c => [c.id,c.name + (c.active ? '' : ' · скрыта')])});
    const price = field('Цена, €','price',row.price === undefined ? '' : (row.price/100).toFixed(2));
    price.inputMode = 'decimal'; price.pattern = '[0-9]+([.,][0-9]{1,2})?'; price.placeholder = '11.90';
    field('Описание','description',row.description,{type:'textarea',wide:true,maxLength:3000});
    const image = field('Фото из локальной библиотеки','image',row.image || images[0],{options:images.map(name => [name,imageLabels[name] || name])});
    const preview = node('img'); preview.id = 'selected-photo'; preview.alt = 'Выбранное фото продукта'; preview.src = '/assets/menu/' + image.value; preview.className = 'wide';
    $('#fields').append(preview); image.addEventListener('change',() => preview.src = '/assets/menu/' + image.value);
    field('Состав / примерные аллергены','allergens',row.allergens,{type:'textarea',wide:true,maxLength:1000});
    field('Приготовление, минут','time',row.time ?? 15,{type:'number',min:0,max:1440,step:1});
    field('Порядок показа','sortOrder',row.sortOrder ?? Math.max(-1,...state.catalogue.products.map(p => p.sortOrder))+1,{type:'number',min:0,max:100000,step:1});
    field('Продукт доступен в меню','available',row.available ?? true,{type:'checkbox',required:false});
  }
  editing.baseline = signature(); $('#editor').showModal();
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
  if(dirty() && !window.confirm('Есть несохранённые изменения. Закрыть редактор без сохранения?')) return;
  $('#editor').close();
}
$('#edit-form').addEventListener('submit',async event => {
  event.preventDefault();
  if(busy || !event.currentTarget.reportValidity()) return;
  const {kind,record} = editing, value = getValues(), collection = kind === 'category' ? 'categories' : 'products';
  const oldIds = new Set(state.catalogue[collection].map(row => row.id));
  setBusy(true); $('#form-status').textContent = 'Сохранение…';
  try {
    state = await save(kind,record,value);
    const saved = state.catalogue[collection].find(row => record ? row.id === record.id : !oldIds.has(row.id));
    selected = kind === 'category' ? saved.id : saved.categoryId;
    $('#search').value = ''; $('#availability').value = 'all';
    $('#editor').close(); render();
    if(kind === 'product') focusProduct(saved.id);
    else $('#edit-category').focus({preventScroll:true});
    status('Сохранено локально. Обнови предпросмотр, чтобы увидеть изменения.');
  } catch(error) {
    $('#form-status').textContent = error.message;
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
        if(category) option.textContent = category.name + (category.active ? '' : ' · скрыта');
      }
    }
    if(editing.record) {
      const latest = next.catalogue[collection].find(row => row.id === editing.record.id);
      if(!latest) throw new Error('Эта запись больше недоступна. Черновик остался в редакторе.');
      const merged = mergeDraft(editing.record,draft,latest);
      editing.record = structuredClone(latest);
      applyValues(latest); editing.baseline = signature(); applyValues(merged.values);
      $('#form-status').textContent = merged.conflicts.length
        ? `Обе вкладки изменили: ${merged.conflicts.map(key => fieldLabels[key] || key).join(', ')}. В редакторе оставлены твои значения этих полей. Проверь их перед сохранением.`
        : 'Актуальная версия загружена. Твой черновик сохранён, независимые изменения другой вкладки добавлены. Проверь и сохрани.';
    } else $('#form-status').textContent = 'Данные обновлены, новый черновик сохранён. Можно повторить сохранение.';
    state = next; render(); $('#refresh-conflict').hidden = true;
  } catch(error) {$('#form-status').textContent = error.message;}
  finally {setBusy(false);}
});
$('#new-category').addEventListener('click',() => open('category'));
$('#new-product').addEventListener('click',() => {
  if(!state.catalogue.categories.length) return status('Сначала добавь категорию.',true);
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
