import test from 'node:test';
import assert from 'node:assert/strict';
import {comparisonIds,toggleCompared,MAX_COMPARED_VEHICLES} from '../src/data/comparison.ts';
test('comparison restores only known unique IDs and caps untrusted stored values',()=>{
 assert.deepEqual(comparisonIds(null),[]);
 assert.deepEqual(comparisonIds(['mazda','mazda','unknown',1,'bmw','porsche','peugeot']),['mazda','bmw','porsche']);
});
test('selection adds, removes and preserves the existing comparison at the limit',()=>{
 let ids=[];for(const id of ['mazda','bmw','porsche'])ids=toggleCompared(ids,id).ids;
 assert.equal(ids.length,MAX_COMPARED_VEHICLES);
 assert.deepEqual(toggleCompared(ids,'peugeot'),{ids,limited:true});
 assert.deepEqual(toggleCompared(ids,'bmw'),{ids:['mazda','porsche'],limited:false});
 assert.deepEqual(toggleCompared(ids,'injected'),{ids,limited:false});
});
