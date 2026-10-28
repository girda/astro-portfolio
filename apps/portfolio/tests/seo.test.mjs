import assert from 'node:assert/strict';
import test from 'node:test';
import { createSiteConfig } from '../src/config/site.ts';
import { absoluteSiteUrl, canonicalUrl, pageAlternates, pageSeo, renderSitemap, renderRobots } from '../src/lib/seo.ts';

for (const [name, config] of [
  ['Pages', createSiteConfig({ base: '/astro-portfolio/' })],
  ['custom domain', createSiteConfig({ origin: 'https://studio.example', base: '/' })],
]) {
  test(`${name}: route canonical preserves base exactly once and removes query/fragment`, () => {
    const home = `${config.origin}${config.base}`;
    assert.equal(canonicalUrl(config.base, config), home);
    assert.equal(canonicalUrl(`${config.base}en/?ref=menu#top`, config), `${home}en/`);
    assert.equal(canonicalUrl(`${config.base}leistungen/`, config), `${home}leistungen/`);
    assert.equal(canonicalUrl('/leistungen/', config), `${home}leistungen/`);
    assert.equal(canonicalUrl(`${config.base}index.html`, config), home);
    assert.equal(absoluteSiteUrl('/social/hirda-de-2026.png', config), `${home}social/hirda-de-2026.png`);
  });
  test(`${name}: alternates exist only for known DE/EN/RU pages`, () => {
    assert.deepEqual(pageAlternates(`${config.base}en/`, config), [
      { lang: 'de', href: `${config.origin}${config.base}` },
      { lang: 'en', href: `${config.origin}${config.base}en/` },
      { lang: 'ru', href: `${config.origin}${config.base}ru/` },
      { lang: 'x-default', href: `${config.origin}${config.base}` },
    ]);
    assert.deepEqual(pageAlternates('/leistungen/', config), []);
  });
  test(`${name}: sitemap excludes experiments, redirects and demos`, () => {
    const xml = renderSitemap(config);
    assert.equal((xml.match(/<url>/g) || []).length, 6);
    assert.ok(xml.includes(`<loc>${config.origin}${config.base}</loc>`));
    assert.ok(xml.includes(`<loc>${config.origin}${config.base}en/</loc>`));
    assert.ok(xml.includes(`<loc>${config.origin}${config.base}ru/</loc>`));
    assert.doesNotMatch(xml, /cat-lab|demos\/|<lastmod>|localhost|127\.0\.0\.1/);
    assert.doesNotMatch(xml, /<loc>[^<]*\/de\//);
  });
}

test('preview disables indexing and sitemap entries; per-page noindex works', () => {
  const preview = createSiteConfig({ origin: 'https://preview.example', indexable: false });
  assert.equal(pageSeo({ path: '/', locale: 'de', config: preview }).robots, 'noindex, follow');
  assert.doesNotMatch(renderSitemap(preview), /<url>/);
  assert.match(renderRobots(preview), /Disallow: \//);
  const live = createSiteConfig();
  assert.equal(pageSeo({ path: '/cat-lab/', locale: 'de', config: live, noindex: true }).robots, 'noindex, follow');
});

test('project robots never pretends to control the whole host', () => {
  const project = renderRobots(createSiteConfig({ base: '/astro-portfolio/' }));
  assert.doesNotMatch(project, /User-agent:|Disallow:/);
  assert.match(project, /Sitemap: https:\/\/girda.github.io\/astro-portfolio\/sitemap.xml/);
  assert.match(renderRobots(createSiteConfig()), /User-agent: \*/);
});

test('invalid origins and external/traversal paths fail rather than leak local URLs', () => {
  for (const origin of ['http://localhost:4321', 'https://127.0.0.1', 'https://user:pass@example.com', 'https://example.com/other/']) {
    assert.throws(() => createSiteConfig({ origin }));
  }
  const config = createSiteConfig({ base: '/astro-portfolio/' });
  for (const path of ['https://evil.example/a', '//evil.example/a', '/../a', '/x/../a']) {
    assert.throws(() => canonicalUrl(path, config));
  }
  assert.equal(createSiteConfig({ base: '/astro-portfolio' }).base, '/astro-portfolio/');
});
