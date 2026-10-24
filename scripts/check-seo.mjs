import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createSiteConfig } from '../apps/portfolio/src/config/site.ts';
import { canonicalUrl, pageAlternates, absoluteSiteUrl } from '../apps/portfolio/src/lib/seo.ts';

import { DEMO_APPS } from './projects.mjs';

const output = resolve(process.argv[2] || 'dist');
const config = createSiteConfig({ origin: process.env.SITE_URL, base: process.env.PAGES_BASE || '/astro-portfolio/', indexable: process.env.SITE_INDEXABLE !== 'false' });
const read = path => readFileSync(join(output, path), 'utf8');
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];
for (const [path, file] of [['/', 'index.html'], ['/en/', 'en/index.html']]) {
  const html = read(file);
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const canonical = head.match(/<link\b[^>]*rel="canonical"[^>]*>/i)?.[0] || '';
  assert.equal(attr(canonical, 'href'), canonicalUrl(path, config), `${file}: canonical`);
  assert.ok(!/localhost|127\.0\.0\.1/.test(head), `${file}: local URL in head`);
  assert.ok(/<title>[^<]+<\/title>/.test(head), `${file}: title`);
  assert.ok(/name="description" content="[^"]+"/.test(head), `${file}: description`);
  const robots = head.match(/<meta\b[^>]*name="robots"[^>]*>/i)?.[0] || '';
  assert.ok(attr(robots, 'content')?.startsWith(config.indexable ? 'index,' : 'noindex,'), `${file}: index policy`);
  for (const alternate of pageAlternates(path, config)) {
    assert.ok(head.includes(`hreflang="${alternate.lang}" href="${alternate.href}"`), `${file}: alternate ${alternate.lang}`);
  }
}
const lab = read('cat-lab/index.html');
assert.match(lab, /name="robots" content="noindex, follow"/);
assert.ok(existsSync(join(output, 'de/index.html')), 'Legacy /de/ redirect missing');
const sitemap = read('sitemap.xml');
assert.equal((sitemap.match(/<url>/g) || []).length, config.indexable ? 2 : 0);
assert.doesNotMatch(sitemap, /cat-lab|demos\/|localhost/);
const robots = read('robots.txt');
if (config.base !== '/') assert.doesNotMatch(robots, /User-agent:|Disallow:/);
if (config.indexable) assert.ok(robots.includes(absoluteSiteUrl('/sitemap.xml', config)));
// Демо не меняем; проверяем, что сборщик сохранил их адреса.
if (existsSync(join(output, 'demos'))) {
  const home = read('index.html');
  for (const id of DEMO_APPS) {
    assert.ok(existsSync(join(output, 'demos', id, 'index.html')), `Missing demo ${id}`);
    assert.ok(home.includes(`${config.base}demos/${id}/`), `Missing demo link ${id}`);
  }
}
console.log(`SEO output PASS: ${config.origin}${config.base} (${config.indexable ? 'indexable' : 'noindex preview'})`);
