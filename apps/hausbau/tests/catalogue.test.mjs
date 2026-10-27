import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectHouses, emptyFilters } from '../src/data/catalogue.ts';
const houses=JSON.parse(readFileSync(new URL('../src/data/houses.json',import.meta.url)));
test('catalogue combines groups with AND, selections within a group with OR',()=>{
 const filters={...emptyFilters(),materials:['Holz','Hybrid'],floors:[1],bedrooms:[2,3]};
 assert.deepEqual(selectHouses(houses,filters).map(h=>h.id),['tannengrund','wiesenhof']);
 assert.equal(selectHouses(houses,{...filters,roofs:['Satteldach']}).length,1);
});
test('area boundaries, search and zero results are respected',()=>{
 assert.deepEqual(selectHouses(houses,{...emptyFilters(),min:125,max:160}).map(h=>h.area),[160,125]);
 assert.equal(selectHouses(houses,{...emptyFilters(),query:'  STEINBACH  '})[0].id,'steinbach');
 assert.equal(selectHouses(houses,{...emptyFilters(),min:300}).length,0);
 assert.equal(selectHouses(houses,{...emptyFilters(),min:200,max:100}).length,0);
});
test('sorting is numeric and never mutates the source catalogue',()=>{
 const original=houses.map(h=>h.id);
 assert.deepEqual(selectHouses(houses,emptyFilters(),'area-asc').map(h=>h.area),[105,125,160,172,208,242]);
 assert.equal(selectHouses(houses,emptyFilters(),'area-desc')[0].area,242);
 assert.deepEqual(houses.map(h=>h.id),original);
});
