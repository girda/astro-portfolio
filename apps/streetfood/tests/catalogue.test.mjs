import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { validateCatalogue } from '../src/data/catalogue-contract.mjs';
const catalogue = JSON.parse(readFileSync(new URL('../src/data/catalogue.json',import.meta.url),'utf8'));

test('menu catalogue preserves 24 products, six real categories and local media', () => {
  assert.equal(validateCatalogue(catalogue), catalogue);
  assert.equal(catalogue.products.length,24);
  assert.equal(catalogue.categories.length,6);
  for (const product of catalogue.products) assert.ok(existsSync(new URL(`../public/assets/menu/${product.image}`,import.meta.url)));
});

test('category-product relation rejects orphans, duplicate IDs and virtual filters', () => {
  for (const mutate of [
    c => { c.categories.pop(); },
    c => { c.products[0].categoryId='missing'; },
    c => { c.products.push({...c.products[0]}); },
    c => { c.categories.push({...c.categories[0]}); },
    c => { c.categories.push({...c.categories[0],id:'favorites'}); },
  ]) {
    const value=structuredClone(catalogue);mutate(value);
    assert.throws(()=>validateCatalogue(value),/Invalid menu catalogue/);
  }
});

test('catalogue rejects unsafe prices and remote or traversing media paths', () => {
  for (const price of [-1,1.5,Infinity,10000001,'1190']) {
    const value=structuredClone(catalogue);value.products[0].price=price;
    assert.throws(()=>validateCatalogue(value),/price in cents/);
  }
  for (const image of ['../chicken.webp','https://example.com/photo.webp','chicken.webp?x=1']) {
    const value=structuredClone(catalogue);value.products[0].image=image;
    assert.throws(()=>validateCatalogue(value),/image filename/);
  }
});
