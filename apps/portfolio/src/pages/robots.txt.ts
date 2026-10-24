import type { APIRoute } from 'astro';
import { createSiteConfig } from '../config/site';
import { renderRobots } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
  const config = createSiteConfig({ origin: site, base: import.meta.env.BASE_URL,
    indexable: import.meta.env.PROD && import.meta.env.SITE_INDEXABLE !== 'false' });
  return new Response(renderRobots(config), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
