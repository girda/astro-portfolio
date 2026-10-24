import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BUILD_APPS, outputPath } from './projects.mjs';
const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'dist');
const base = (process.env.PAGES_BASE || '/astro-portfolio/').replace(/\/?$/, '/');
const site = process.env.SITE_URL;
rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
for (const app of BUILD_APPS) {
  const folder = resolve(root, 'apps', app);
  const suffix = outputPath(app);
  const result = spawnSync(process.execPath, [resolve(folder, 'node_modules/astro/bin/astro.mjs'), 'build'], {
    cwd: folder, stdio: 'inherit',
    env: { ...process.env, SITE_BASE: base + suffix, ...(site ? { SITE_URL: site } : {}) },
  });
  if (result.status !== 0) process.exit(result.status || 1);
  cpSync(resolve(folder, 'dist'), resolve(destination, suffix), { recursive: true });
}
writeFileSync(resolve(destination, '.nojekyll'), '');
