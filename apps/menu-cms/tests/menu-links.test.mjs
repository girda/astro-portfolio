import test from 'node:test';import assert from 'node:assert/strict';
import {buildMenuUrl,DEFAULT_MENU_ROOT} from '../../streetfood/src/data/menu-options.mjs';
import qrcode from 'qrcode-generator';
test('QR links preserve the public base and choose the right menu',()=>{
 assert.equal(buildMenuUrl(DEFAULT_MENU_ROOT,'pizzeria'),DEFAULT_MENU_ROOT+'pizzeria/');
 assert.equal(buildMenuUrl('https://cafe.de/menu','diner'),'https://cafe.de/menu/bunhafen/');
 assert.equal(buildMenuUrl('https://cafe.de','streetfood'),'https://cafe.de/');
});
test('QR rejects unsafe, private and ambiguous menu URLs',()=>{
 for(const root of ['javascript:alert(1)','http://cafe.de','https://user:pass@cafe.de','https://localhost/menu/','https://127.0.0.1/','https://cafe.de/?x=1','https://cafe.de/#x',''])assert.throws(()=>buildMenuUrl(root,'diner'));
 assert.throws(()=>buildMenuUrl('https://cafe.de/','missing'));
});
test('QR generator produces scalable SVG for the full public menu URL',()=>{
 const qr=qrcode(0,'M');qr.addData(buildMenuUrl(DEFAULT_MENU_ROOT,'pizzeria'),'Byte');qr.make();
 assert.ok(qr.getModuleCount()>=21);const svg=qr.createSvgTag({cellSize:6,margin:24,scalable:true});assert.match(svg,/<svg/);assert.match(svg,/viewBox=/);
});
