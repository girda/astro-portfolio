import test from 'node:test';
import assert from 'node:assert/strict';
import {cartFlight,CART_FLIGHT_DURATION} from '../src/scripts/menu-motion.mjs';
const point=key=>key.transform.match(/translate\(([-\d.]+)px,([-\d.]+)px\)/).slice(1).map(Number);
test('cart follows one continuous parabola, rises and lands at the basket centre',()=>{
 const path=cartFlight({left:20,top:200,width:120,height:120},{left:10,top:700,width:370,height:60},844);
 const points=path.keyframes.map(point);
 assert.deepEqual(points[0],[0,0]);assert.deepEqual(points.at(-1),[115,470]);
 assert.ok(points.some(([,y])=>y<0));
 // У квадратичной кривой вторая разность постоянна: нет углового перелома вниз.
 const second=points.slice(2).map((p,i)=>p[1]-2*points[i+1][1]+points[i][1]);
 assert.ok(Math.max(...second)-Math.min(...second)<1e-9);
 assert.ok(CART_FLIGHT_DURATION<650);assert.equal(path.top,228);assert.equal(path.left,48);
});
test('offscreen product origin is brought inside the viewport before a flight',()=>{
 for(const top of [-1000,2000]){const path=cartFlight({left:20,top,width:100,height:100},{left:10,top:650,width:300,height:60},760);assert.ok(path.top>=20);assert.ok(path.top<=628);}
});
