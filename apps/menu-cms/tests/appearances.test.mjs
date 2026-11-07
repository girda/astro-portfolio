import test from 'node:test';
import assert from 'node:assert/strict';
import {startCms} from '../server.mjs';

test('all appearance previews inject the current draft and preserve the selected design',async()=>{
  const app=await startCms({port:0,path:':memory:'});
  try{
    const initial=app.store.read();const product=initial.catalogue.products[0];
    app.store.saveProduct({...product,name:'Changed in CMS <draft>'},{id:product.id,revision:initial.revision});
    for(const theme of ['streetfood','diner','pizzeria']){
      const response=await fetch(app.url+'/preview/'+(theme==='streetfood'?'':theme+'/'));
      assert.equal(response.status,200);
      const html=await response.text();
      assert.ok(html.includes(`data-appearance="${theme}"`));
      const serialized=html.match(/<script\b[^>]*id="menu-data"[^>]*>([\s\S]*?)<\/script>/)[1];
      assert.ok(!serialized.includes('<draft>'));
      assert.equal(JSON.parse(serialized).products[0].name,'Changed in CMS <draft>');
      assert.ok(html.includes('data-menu-preview'));
      assert.ok(!html.includes('/astro-portfolio/demos/streetfood/'));
    }
    assert.equal((await fetch(app.url+'/preview/unknown/')).status,404);
  }finally{await app.close();}
});
