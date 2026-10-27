export const siteLocales = ['de', 'en', 'ru'] as const;
export type SiteLocale = typeof siteLocales[number];
export interface SiteConfig {
  name: string;
  origin: string;
  base: string;
  indexable: boolean;
  locales: readonly SiteLocale[];
  defaultLocale: SiteLocale;
}

export const defaultOrigin = 'https://girda.github.io';
export const pageRoutes = [{ key: 'home', paths: { de: '/', en: '/en/', ru: '/ru/' } }] as const;

export function createSiteConfig(options: {
  origin?: string | URL;
  base?: string;
  indexable?: boolean;
} = {}): SiteConfig {
  const url = new URL(options.origin ?? defaultOrigin);
  // Canonical всегда указывает на публичный origin, а не адрес локального сервера.
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      url.pathname !== '/' || /^(localhost|127\.|\[::1\])/i.test(url.hostname)) {
    throw new Error('SITE_URL must be a public HTTPS origin without a path');
  }
  const base = options.base ?? '/';
  if (!base.startsWith('/') || base.startsWith('//') || /[?#\\]|(?:^|\/)\.\.?($|\/)/.test(base)) {
    throw new Error('SITE_BASE must be an absolute pathname');
  }
  return {
    name: 'HIRDA', origin: url.origin,
    base: `/${base.split('/').filter(Boolean).join('/')}${base === '/' ? '' : '/'}`,
    indexable: options.indexable ?? true,
    locales: siteLocales, defaultLocale: 'de',
  };
}
