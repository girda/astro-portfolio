import type { APIRoute } from 'astro';
import { createSiteConfig } from '../config/site';
import { renderSitemap } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
  const config = createSiteConfig({ origin: site, base: import.meta.env.BASE_URL,
    indexable: import.meta.env.PROD && import.meta.env.SITE_INDEXABLE !== 'false' });
  return new Response(renderSitemap(config), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
