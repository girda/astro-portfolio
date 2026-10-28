import test from 'node:test';
import assert from 'node:assert/strict';
import pricing from '../src/data/pricing.json' with { type: 'json' };
import { projects } from '../src/data/projects.ts';
import { pixelBusinessFacts } from '../src/data/pixel-facts.ts';

for (const lang of ['de', 'en', 'ru']) {
  test(`Pixel ${lang}: fallback uses every current package price and project`, () => {
    const facts = pixelBusinessFacts(lang);
    for (const [name, price] of pricing[lang]) {
      assert.ok(facts.pricing.includes(`${name}: ${price}`));
    }
    for (const project of Object.values(projects)) assert.ok(facts.projects.includes(project.name));
    assert.ok(facts.projects.includes(String(Object.keys(projects).length)));
  });
}
