import test from 'node:test';
import assert from 'node:assert/strict';
import {cartFlight} from '../src/scripts/menu-motion.mjs';
test('cart flight rises before reaching the centre and finishes at the basket centre',()=>{
 const from={left:20,top:200,width:120,height:120},to={left:10,top:700,width:370,height:60};
 const path=cartFlight(from,to,844),peak=path.keyframes[1].transform,landing=path.keyframes.at(-1).transform;
 assert.match(peak,/translate\([\d.]+px,-[\d.]+px\)/);
 assert.equal(landing,'translate(115px,470px) scale(.12)');
 assert.equal(path.top,228);assert.equal(path.left,48);
});
test('offscreen product origin is brought inside the viewport before a flight',()=>{
 for(const top of [-1000,2000]){const path=cartFlight({left:20,top,width:100,height:100},{left:10,top:650,width:300,height:60},760);assert.ok(path.top>=20);assert.ok(path.top<=628);}
});
