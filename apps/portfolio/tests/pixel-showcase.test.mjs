import test from 'node:test';
import assert from 'node:assert/strict';
import {pixelScenarios, pixelShowcase} from '../src/data/pixel-showcase.ts';
import {validate, answer} from '../../assistant-api/api.mjs';

for(const lang of ['de','en','ru']) test(`Pixel ${lang}: every showcase opens a server-supported business demo`,()=>{
 assert.deepEqual(pixelShowcase.cases[lang].map(item=>item.id),pixelScenarios);
 for(const item of pixelShowcase.cases[lang]) {
  assert.doesNotThrow(()=>validate({lang,mode:'demo',scenario:item.id,messages:[{role:'user',content:'Start demo'}]}));
  assert.ok(item.messages.length>=3 && item.result.length>30);
 }
});
test('home services uses its own server instructions and produces a draft without a cart',async()=>{
 let instructions='';
 const result=await answer({lang:'de',mode:'demo',scenario:'handwerker',messages:[{role:'user',content:'55 Zoll TV an Betonwand montieren'}]}, {
  apiKey:'test-only', fetchImpl:async(_url,options)=>{
   instructions=JSON.parse(options.body).instructions;
   return Response.json({status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify({text:'Demo-Entwurf vorbereitet.',choices:['Entwurf passt'],summary:'TV 55 Zoll, Betonwand',cart:[]})}]}]});
  }
 });
 assert.match(instructions,/home-services coordinator/);
 assert.match(instructions,/Do not promise/);
 assert.match(instructions,/hazardous/);
 assert.deepEqual(result.cart,[]);
 assert.equal(result.summary,'TV 55 Zoll, Betonwand');
});
