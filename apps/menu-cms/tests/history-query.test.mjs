import test from 'node:test';
import assert from 'node:assert/strict';
import {createMenuStore} from '../store.mjs';
import {historyQuery} from '../history-query.mjs';
import {messages,translate} from '../public/i18n.mjs';
test('filtered history searches all records, paginates and freezes the snapshot',()=>{
 const store=createMenuStore(':memory:');try{
  for(let revision=1;revision<=25;revision++)store.saveCategory({name:'Category '+revision,symbol:'x',sortOrder:revision,active:true},{revision});
  const first=store.queryHistory({pageSize:10,sort:'oldest'});assert.equal(first.total,25);assert.equal(first.pages,3);assert.equal(first.entries[0].revision,2);
  const product=store.read().catalogue.products[0];store.saveProduct({...product,price:product.price+100},{id:product.id,revision:26});
  const second=store.queryHistory({pageSize:10,page:2,sort:'oldest',anchor:first.anchor});assert.equal(second.total,25);assert.equal(second.entries[0].revision,12);
  const changed=store.queryHistory({kind:'products',field:'price'});assert.equal(changed.total,1);assert.equal(changed.entries[0].revision,27);
  assert.equal(store.queryHistory({q:'Category 25'}).total,1);assert.equal(store.queryHistory({action:'create'}).total,25);assert.equal(store.queryHistory({kind:'settings'}).total,0);
  assert.equal(store.queryHistory({page:999,pageSize:10}).page,3);
 }finally{store.close()}
});
test('history rejects invalid filters and date boundaries',()=>{
 for(const input of [{page:0},{pageSize:100},{sort:'DROP TABLE history'},{field:'unknown'},{q:{}},{from:'2026-02-30'},{from:'2026-11-09',to:'2026-11-08'},{anchor:0}])assert.throws(()=>historyQuery(input));
});
test('CMS translations keep user content intact and provide German and English messages',()=>{
 assert.equal(translate('Сохранить','de'),'Speichern');assert.equal(translate('Сохранить','en'),'Save');assert.equal(translate('Сохранить','ru'),'Сохранить');assert.equal(translate('  Сохранить  ','en'),'  Save  ');assert.equal(translate('Mein eigener Burger','de'),'Mein eigener Burger');
 for(const [source,value]of Object.entries(messages))for(const locale of ['de','en']){assert.ok(value[locale]?.length,source);assert.doesNotMatch(value[locale],/[А-Яа-яЁё]/,source);}
});
