import test from 'node:test';
import assert from 'node:assert/strict';
import {startCms} from '../server.mjs';
import {DEFAULT_SETTINGS} from '../../streetfood/src/data/menu-options.mjs';

test('all appearance previews inject the current draft and preserve the selected design',async()=>{
  const app=await startCms({port:0,path:':memory:'});
  try{
    const initial=app.store.read();const product=initial.catalogue.products[0];
    app.store.saveProduct({...product,name:'Changed in CMS <draft>'},{id:product.id,revision:initial.revision});
    app.store.saveSettings({...DEFAULT_SETTINGS,showPrices:false},{revision:2});
    for(const theme of ['streetfood','diner','pizzeria']){
      const response=await fetch(app.url+'/preview/'+(theme==='streetfood'?'':theme+'/'));
      assert.equal(response.status,200);
      if(theme==='diner')assert.equal(new URL(response.url).pathname,'/preview/bunhafen/');
      const html=await response.text();
      assert.ok(html.includes(`data-appearance="${theme}"`));
      const serialized=html.match(/<script\b[^>]*id="menu-data"[^>]*>([\s\S]*?)<\/script>/)[1];
      assert.ok(!serialized.includes('<draft>'));
      assert.equal(JSON.parse(serialized).products[0].name,'Changed in CMS <draft>');
      assert.ok(html.includes('data-menu-preview'));
      assert.ok(html.includes('data-price-visibility="hidden"'));
      assert.equal(JSON.parse(serialized).settings.showPrices,false);
      const styles=[...html.matchAll(/href="([^"]+\.css)"/g)].map(m=>m[1]).filter(url=>url.startsWith('/preview/'));
      for(const url of styles){
        const cssResponse=await fetch(app.url+url);assert.equal(cssResponse.status,200);
        const css=await cssResponse.text();assert.ok(!css.includes('/astro-portfolio/demos/streetfood/'));
        const assets=[...css.matchAll(/url\(["']?(\/preview\/[^)"']+)/g)].map(m=>m[1]);
        for(const asset of new Set(assets))assert.equal((await fetch(app.url+asset)).status,200,asset);
      }
      assert.ok(!html.includes('/astro-portfolio/demos/streetfood/'));
    }
    assert.equal((await fetch(app.url+'/preview/unknown/')).status,404);
  }finally{await app.close();}
});
