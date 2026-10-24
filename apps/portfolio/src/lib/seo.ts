import { pageRoutes, type SiteConfig, type SiteLocale } from '../config/site.ts';

function localPath(path: string, config: SiteConfig): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//') || path.includes('\\')) {
    throw new Error('Expected a local site path');
  }
  let value = path.split(/[?#]/, 1)[0];
  value = `/${value.replace(/^\/+/, '')}`;
  const prefix = config.base.replace(/\/$/, '');
  if (prefix && (value === prefix || value.startsWith(`${prefix}/`))) value = value.slice(prefix.length) || '/';
  if (/(?:^|\/)\.\.?($|\/)/.test(value)) throw new Error('Path traversal is not a site route');
  return value;
}

export function absoluteSiteUrl(path: string, config: SiteConfig): string {
  return new URL(`${config.base}${localPath(path, config).replace(/^\//, '')}`, config.origin).href;
}

export function canonicalUrl(path: string, config: SiteConfig): string {
  const page = localPath(path, config).replace(/(?:^|\/)index\.html$/, '/').replace(/\/+$/, '');
  return absoluteSiteUrl(`${page}/`, config);
}

export function pageAlternates(path: string, config: SiteConfig) {
  const current = canonicalUrl(path, config);
  const route = pageRoutes.find(route => Object.values(route.paths).some(value => canonicalUrl(value, config) === current));
  if (!route) return [];
  // Альтернативы выдаём только для реально существующей пары страниц.
  return [
    ...config.locales.map(lang => ({ lang, href: canonicalUrl(route.paths[lang], config) })),
    { lang: 'x-default', href: canonicalUrl(route.paths[config.defaultLocale], config) },
  ];
}

export function pageSeo(options: { path: string; locale: SiteLocale; config: SiteConfig; noindex?: boolean; image?: string }) {
  const { path, locale, config } = options;
  const indexable = config.indexable && !options.noindex;
  return {
    canonical: canonicalUrl(path, config),
    image: absoluteSiteUrl(options.image ?? `/social/hirda-${locale}-2026.png`, config),
    robots: indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow',
    alternates: pageAlternates(path, config),
  };
}

const escapeXml = (value: string) => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);

export function renderSitemap(config: SiteConfig): string {
  const entries = config.indexable ? pageRoutes.flatMap(route => config.locales.map(locale => {
    const href = canonicalUrl(route.paths[locale], config);
    const alternates = pageAlternates(route.paths[locale], config).map(item =>
      `<xhtml:link rel="alternate" hreflang="${item.lang}" href="${escapeXml(item.href)}"/>`).join('');
    return `<url><loc>${escapeXml(href)}</loc>${alternates}</url>`;
  })).join('') : '';
  // Не добавляем дату сборки как выдуманный lastmod изменения контента.
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>\n`;
}

export function renderRobots(config: SiteConfig): string {
  const sitemap = config.indexable ? `Sitemap: ${absoluteSiteUrl('/sitemap.xml', config)}\n` : '';
  if (config.base !== '/') {
    // Project Pages не даёт этому файлу управлять корнем host. Не публикуем чужие host-wide правила.
    return `# This project is hosted below ${config.base}\n# Crawlers read robots.txt only at the origin root. Page indexing is controlled by meta robots.\n${sitemap}`;
  }
  return `User-agent: *\n${config.indexable ? 'Allow: /' : 'Disallow: /'}\n${sitemap}`;
}
