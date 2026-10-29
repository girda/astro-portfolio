import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { excludedPublicAssets } from './public-assets.mjs';
import { htmlSafetyIssues } from './public-safety.mjs';
const root = resolve(process.argv[2] || 'dist');
let count = 0;
function scan(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) scan(path);
    else if (entry.name.endsWith('.html')) {
      count++;
      const issues = htmlSafetyIssues(readFileSync(path, 'utf8'));
      if (issues.length) throw new Error(`${path}: ${issues.join(', ')}`);
    }
  }
}
scan(root);
for(const asset of excludedPublicAssets) if(existsSync(join(root,asset))) throw new Error(`Uncleared public asset: ${asset}`);
if (!count) throw new Error('No built HTML to check');
console.log(`Public safety baseline PASS: ${count} HTML pages (forms, fonts, visit storage)`);
