import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,join,basename,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {isPublicAssetAllowed} from './public-assets.mjs';
import {publicLicenses} from './license-notices.mjs';
const root=resolve(import.meta.dirname,'..');
const dist=resolve(process.argv[2]||'dist');
const registry=JSON.parse(readFileSync(resolve(root,'docs/MEDIA_PROVENANCE_2026-10-30.json'),'utf8'));
const digest=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
let checked=0;
for(const row of registry.records){
 // Импортированные Astro-ресурсы проверяем по фактическому хешу содержимого в dist.
 const bundled=row.file.match(/^apps\/([^/]+)\/src\/assets\/(.+)$/);
 if(bundled){
  assert.equal(row.published,true,`Imported media publication status: ${row.file}`);
  const directory=join(dist,`demos/${bundled[1]}/_astro`),name=basename(bundled[2],extname(bundled[2]));
  const outputs=readdirSync(directory).filter(file=>file.startsWith(name+'.')&&extname(file)===extname(bundled[2]));
  assert.ok(outputs.some(file=>digest(join(directory,file))===row.sha256),`Missing or changed bundled media: ${row.file}`);checked++;continue;
 }
 const match=row.file.match(/^apps\/([^/]+)\/public\/(.+)$/);assert.ok(match,`Invalid asset path: ${row.file}`);
 const target=(match[1]==='portfolio'?'':`demos/${match[1]}/`)+match[2];
 assert.equal(row.published,isPublicAssetAllowed(target),`Registry publication status: ${target}`);
 const path=join(dist,target);
 if(!row.published){assert.ok(!existsSync(path),`Excluded source leaked: ${target}`);continue;}
 assert.ok(existsSync(path),`Missing registered media: ${target}`);
 assert.equal(digest(path),row.sha256,`Media changed without provenance update: ${target}`);checked++;
}
for(const[source,name]of publicLicenses)assert.equal(digest(join(dist,'licenses',name)),digest(resolve(root,source)),`Full licence notice: ${name}`);
assert.equal(readdirSync(join(dist,'previews')).length,36,'Only the current 36 project captures are published');
console.log(`Media output PASS: ${checked} registered public assets and ${publicLicenses.length} complete notices. Provenance checks are not legal clearance.`);
