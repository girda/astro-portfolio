import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {legalOperator} from '../apps/portfolio/src/config/legal.ts';
import {createSiteConfig} from '../apps/portfolio/src/config/site.ts';
import {canonicalUrl} from '../apps/portfolio/src/lib/seo.ts';

// Проверяем публичные переходы по готовому artifact, а не исходные шаблоны.
const output=resolve(process.argv[2] || 'dist');
const config=createSiteConfig({origin:process.env.SITE_URL,base:process.env.PAGES_BASE || '/astro-portfolio/'});
const pages=[];
function walk(folder){for(const entry of readdirSync(folder,{withFileTypes:true})){const file=join(folder,entry.name);if(entry.isDirectory())walk(file);else if(entry.name.endsWith('.html'))pages.push(file);}}
walk(output);
for(const slug of ['impressum','datenschutz']){
 const file=join(output,slug,'index.html');
 assert.ok(existsSync(file),`Missing ${slug}`);
 const html=readFileSync(file,'utf8');
 for(const value of Object.values(legalOperator))assert.ok(html.includes(value),`${slug}: operator data missing`);
 assert.ok(html.includes(`rel="canonical" href="${canonicalUrl('/'+slug+'/',config)}"`),`${slug}: canonical`);
 assert.doesNotMatch(html,/Arbeitsentwurf|nicht veröffentlichen|\[PLATZHALTER|TODO|hirda-cat-panel|challenges\.cloudflare\.com/);
 assert.doesNotMatch(html,/<link[^>]+hreflang=/);
}
let checked=0;
for(const file of pages){
 const html=readFileSync(file,'utf8');
 if(!html.includes('hirda-demo-notice') && !html.includes('class="site-footer"'))continue;
 for(const slug of ['impressum','datenschutz'])assert.ok(html.includes(`href="${config.base}${slug}/"`),`${file}: ${slug} link/base`);
 checked++;
}
assert.ok(checked>=2,'No public footer coverage');
console.log(`Legal output PASS: 2 pages, ${checked} footer instances (routes, links, canonical, no placeholders or chat)`);
