import test from 'node:test';
import assert from 'node:assert/strict';
import { selectProjectPage } from '../src/data/project-gallery.ts';
const projects=Array.from({length:14},(_,index)=>({id:index,group:index<2?'homes':'handwerk'}));
test('gallery shows six projects and preserves their configured order between pages',()=>{
 assert.deepEqual(selectProjectPage(projects,'all',1).items.map(x=>x.id),[0,1,2,3,4,5]);
 assert.deepEqual(selectProjectPage(projects,'all',2).items.map(x=>x.id),[6,7,8,9,10,11]);
 assert.deepEqual(selectProjectPage(projects,'all',3).items.map(x=>x.id),[12,13]);
});
test('houses are separate from trades; pagination applies after filtering',()=>{
 assert.deepEqual(selectProjectPage(projects,'homes').items.map(x=>x.id),[0,1]);
 const trades=selectProjectPage(projects,'handwerk',2);assert.equal(trades.total,12);assert.equal(trades.pages,2);assert.deepEqual(trades.items.map(x=>x.id),[8,9,10,11,12,13]);
});
test('empty filters and invalid page values remain safe',()=>{
 for(const page of [0,-1,NaN,Infinity])assert.equal(selectProjectPage(projects,'all',page).current,1);
 assert.equal(selectProjectPage(projects,'all',99).current,3);
 const empty=selectProjectPage(projects,'food',99);assert.deepEqual(empty.items,[]);assert.equal(empty.current,1);assert.equal(empty.total,0);
});
