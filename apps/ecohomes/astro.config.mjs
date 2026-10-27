import {fileURLToPath} from 'node:url';
import { defineConfig } from "astro/config";
export default defineConfig({
  site: process.env.SITE_URL,
  base: process.env.SITE_BASE || "/",
  trailingSlash: "always",
  vite:{server:{fs:{allow:[fileURLToPath(new URL('.',import.meta.url)),fileURLToPath(new URL('../../packages/ui',import.meta.url))]}}},
});
