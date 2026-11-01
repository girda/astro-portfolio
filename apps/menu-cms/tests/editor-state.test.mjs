import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeDraft,selectProducts} from '../public/editor-state.mjs';

test('conflict recovery preserves independent edits and reports overlapping changes',() => {
  const base={name:'Coffee',price:350,available:true};
  const draft={...base,price:450};
  assert.deepEqual(mergeDraft(base,draft,{...base,available:false}),{values:{name:'Coffee',price:450,available:false},conflicts:[]});
  assert.deepEqual(mergeDraft(base,draft,{...base,price:500}),{values:draft,conflicts:['price']});
  assert.deepEqual(mergeDraft(base,draft,{...base,price:450}),{values:draft,conflicts:[]});
});

test('list filters account for hidden categories, search names and sort prices numerically without mutation',() => {
  const catalogue={categories:[{id:'coffee',name:'Kaffee',active:true},{id:'food',name:'Burger',active:false}],products:[
    {id:'a',name:'Espresso',categoryId:'coffee',description:'Small',price:240,sortOrder:2,available:true},
    {id:'b',name:'Latte',categoryId:'coffee',description:'Milky',price:1190,sortOrder:1,available:false},
    {id:'c',name:'Beef',categoryId:'food',description:'Classic',price:990,sortOrder:0,available:true},
  ]};
  const before=structuredClone(catalogue);
  assert.deepEqual(selectProducts(catalogue,{query:'KAFFEE',sort:'price-desc'}).map(p=>p.id),['b','a']);
  assert.deepEqual(selectProducts(catalogue,{availability:'visible'}).map(p=>p.id),['a']);
  assert.deepEqual(selectProducts(catalogue,{availability:'hidden',sort:'price-asc'}).map(p=>p.id),['c','b']);
  assert.equal(selectProducts(catalogue,{categoryId:'food',query:'absent'}).length,0);
  assert.deepEqual(catalogue,before);
});
