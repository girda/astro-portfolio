import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveProjectOrder } from '../src/data/project-order.ts';
test('portfolio JSON controls ordering, omitted projects remain visible',()=>{
 assert.deepEqual(resolveProjectOrder(['a','b','c'],['c','a']),['c','a','b']);
 assert.throws(()=>resolveProjectOrder(['a'],['a','a']),/Duplicate/);
 assert.throws(()=>resolveProjectOrder(['a'],['typo']),/Unknown/);
 const order=JSON.parse(readFileSync(new URL('../src/data/project-order.json',import.meta.url)));
 assert.equal(order[0],'lindenhof');assert.equal(order[1],'hausbau');assert.equal(order.at(-1),'ecohomes');
});
