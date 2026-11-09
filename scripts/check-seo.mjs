import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pageRoutes } from '../apps/portfolio/src/config/site.ts';
import { deploymentConfig as config } from './deployment-config.mjs';
import { canonicalUrl, pageAlternates, absoluteSiteUrl, renderRobots, renderSitemap } from '../apps/portfolio/src/lib/seo.ts';

import { DEMO_APPS } from './projects.mjs';

const output = resolve(process.argv[2] || 'dist');
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
assert.equal(sitemap, renderSitemap(config), 'Sitemap URLs and alternates must match the deployment');
const robots = read('robots.txt');
assert.equal(robots, renderRobots(config), 'robots.txt must match the deployment origin, base and indexing policy');
// Проверяем адреса демо и существующие canonical, включая вложенные страницы и redirect.
if (existsSync(join(output, 'demos'))) {
  const home = read('index.html');
  for (const entry of readdirSync(join(output, 'demos'), { recursive: true })) {
    if (!entry.endsWith('.html')) continue;
    const html = read(join('demos', entry));
    for (const tag of html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)) {
      const href = attr(tag[0], 'href');
      const url = new URL(href);
      assert.equal(url.origin, config.origin, `${entry}: demo canonical origin`);
      const prefix = `${config.base}demos/${entry.split('/')[0]}/`;
      assert.ok(url.pathname.startsWith(prefix), `${entry}: demo canonical base`);
      const path = url.pathname.slice(config.base.length);
      assert.ok(existsSync(join(output, path, 'index.html')), `${entry}: canonical target missing`);
    }
  }
  for (const id of DEMO_APPS) {
    assert.ok(existsSync(join(output, 'demos', id, 'index.html')), `Missing demo ${id}`);
    assert.ok(home.includes(`${config.base}demos/${id}/`), `Missing demo link ${id}`);
  }
}
console.log(`SEO output PASS: ${config.origin}${config.base} (${config.indexable ? 'indexable' : 'noindex preview'})`);
