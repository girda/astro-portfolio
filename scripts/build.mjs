import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, renameSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { isPublicAssetAllowed } from './public-assets.mjs';
import { BUILD_APPS, outputPath } from './projects.mjs';
import { publicLicenses } from './license-notices.mjs';
import { deploymentConfig } from './deployment-config.mjs';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'dist');
const staging = mkdtempSync(resolve(root, '.build-'));
try {
  for (const app of BUILD_APPS) {
    const folder = resolve(root, 'apps', app);
    const suffix = outputPath(app);
    const result = spawnSync(process.execPath, [resolve(folder, 'node_modules/astro/bin/astro.mjs'), 'build'], {
      cwd: folder, stdio: 'inherit',
      env: { ...process.env, SITE_BASE: deploymentConfig.base + suffix, SITE_URL: deploymentConfig.origin },
    });
    if (result.error || result.status !== 0) throw new Error(`Build failed: ${app}`, {cause: result.error});
    mkdirSync(resolve(staging, suffix), {recursive: true});
    cpSync(resolve(folder, 'dist'), resolve(staging, suffix), {recursive: true, filter: source => isPublicAssetAllowed([suffix, relative(resolve(folder, 'dist'),source)].filter(Boolean).join('/'))});
  }
  mkdirSync(resolve(staging, 'licenses'), {recursive:true});
  for(const [source,name] of publicLicenses) cpSync(resolve(root,source),resolve(staging,'licenses',name));
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
