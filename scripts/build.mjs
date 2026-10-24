import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BUILD_APPS, outputPath } from './projects.mjs';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'dist');
const staging = mkdtempSync(resolve(root, '.build-'));
const base = (process.env.PAGES_BASE || '/astro-portfolio/').replace(/\/?$/, '/');
const site = process.env.SITE_URL;
try {
  for (const app of BUILD_APPS) {
    const folder = resolve(root, 'apps', app);
    const suffix = outputPath(app);
    const result = spawnSync(process.execPath, [resolve(folder, 'node_modules/astro/bin/astro.mjs'), 'build'], {
      cwd: folder, stdio: 'inherit',
      env: { ...process.env, SITE_BASE: base + suffix, ...(site ? { SITE_URL: site } : {}) },
    });
    if (result.error || result.status !== 0) throw new Error(`Build failed: ${app}`, {cause: result.error});
    mkdirSync(resolve(staging, suffix), {recursive: true});
    cpSync(resolve(folder, 'dist'), resolve(staging, suffix), {recursive: true});
  }
  writeFileSync(resolve(staging, '.nojekyll'), '');
  // Не удаляем последнюю рабочую сборку, пока все приложения не собрались.
  rmSync(destination, {recursive: true, force: true});
  renameSync(staging, destination);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  rmSync(staging, {recursive: true, force: true});
}
