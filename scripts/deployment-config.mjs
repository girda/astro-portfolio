import { createSiteConfig, legacyPagesBase } from '../apps/portfolio/src/config/site.ts';

export const deploymentConfig = createSiteConfig({
  origin: process.env.SITE_URL,
  base: process.env.PAGES_BASE ?? legacyPagesBase,
  indexable: process.env.SITE_INDEXABLE !== 'false',
});
