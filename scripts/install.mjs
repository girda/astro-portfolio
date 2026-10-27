import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { BUILD_APPS } from './projects.mjs';
const root = resolve(import.meta.dirname, '..');
for (const app of BUILD_APPS) {
  const result = spawnSync('npm', ['ci', '--prefix', resolve(root, 'apps', app)], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error || result.status !== 0) throw new Error(`Dependency installation failed: ${app}`, { cause: result.error });
}
