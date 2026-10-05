import { defineConfig } from 'astro/config';
export default defineConfig({ site: process.env.SITE_URL, base: process.env.SITE_BASE || '/', trailingSlash: 'always' });
