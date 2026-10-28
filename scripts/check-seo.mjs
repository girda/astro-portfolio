import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pageRoutes, createSiteConfig } from '../apps/portfolio/src/config/site.ts';
import { canonicalUrl, pageAlternates, absoluteSiteUrl } from '../apps/portfolio/src/lib/seo.ts';

import { DEMO_APPS } from './projects.mjs';

const output = resolve(process.argv[2] || 'dist');
const config = createSiteConfig({ origin: process.env.SITE_URL, base: process.env.PAGES_BASE || '/astro-portfolio/', indexable: process.env.SITE_INDEXABLE !== 'false' });
const read = path => readFileSync(join(output, path), 'utf8');
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];
for (const [path, file] of pageRoutes.flatMap(route => config.locales.map(locale => [route.paths[locale], route.paths[locale].replace(/^\//, '') + 'index.html']))) {
  const html = read(file);
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const canonical = head.match(/<link\b[^>]*rel="canonical"[^>]*>/i)?.[0] || '';
  assert.equal(attr(canonical, 'href'), canonicalUrl(path, config), `${file}: canonical`);
  assert.ok(!/localhost|127\.0\.0\.1/.test(head), `${file}: local URL in head`);
  assert.ok(/<title>[^<]+<\/title>/.test(head), `${file}: title`);
  assert.ok(/name="description" content="[^"]+"/.test(head), `${file}: description`);
  const locale = path.startsWith('/ru/') ? 'ru' : path.startsWith('/en/') ? 'en' : 'de';
  const social = head.match(/<meta\b[^>]*property="og:image"[^>]*>/i)?.[0] || '';
  assert.equal(attr(social, 'content'), absoluteSiteUrl(`/social/hirda-${locale}-2026.png`, config), `${file}: social image URL`);
  assert.ok(existsSync(join(output, 'social', `hirda-${locale}-2026.png`)), `${file}: social image missing`);
  const robots = head.match(/<meta\b[^>]*name="robots"[^>]*>/i)?.[0] || '';
  assert.ok(attr(robots, 'content')?.startsWith(config.indexable ? 'index,' : 'noindex,'), `${file}: index policy`);
  for (const alternate of pageAlternates(path, config)) {
    assert.ok(head.includes(`hreflang="${alternate.lang}" href="${alternate.href}"`), `${file}: alternate ${alternate.lang}`);
  }
}
const lab = read('cat-lab/index.html');
assert.match(lab, /name="robots" content="noindex, follow"/);
assert.match(read('lab/index.html'), /name="robots" content="noindex,\s*follow"/);
assert.ok(existsSync(join(output, 'de/index.html')), 'Legacy /de/ redirect missing');
const sitemap = read('sitemap.xml');
assert.equal((sitemap.match(/<url>/g) || []).length, config.indexable ? pageRoutes.length * config.locales.length : 0);
assert.doesNotMatch(sitemap, /(?:cat-)?lab|demos\/|localhost/);
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
