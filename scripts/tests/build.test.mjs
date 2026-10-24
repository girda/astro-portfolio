import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, existsSync, readdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {BUILD_APPS} from '../projects.mjs';

test('a failed demo build preserves the last complete output; success replaces it', () => {
  const root = mkdtempSync(join(tmpdir(), 'hirda-build-test-'));
  try {
    mkdirSync(join(root,'scripts'));
    for (const name of ['build.mjs','projects.mjs']) cpSync(new URL(`../${name}`, import.meta.url),join(root,'scripts',name));
    mkdirSync(join(root,'dist')); writeFileSync(join(root,'dist','previous.txt'),'working');
    for (const app of BUILD_APPS) {
      const bin=join(root,'apps',app,'node_modules','astro','bin');mkdirSync(bin,{recursive:true});
      writeFileSync(join(bin,'astro.mjs'), `import {mkdirSync,writeFileSync} from 'node:fs';
        if(process.env.FAIL_APP==='${app}')process.exit(1);
        mkdirSync('dist',{recursive:true});writeFileSync('dist/index.html',process.env.SITE_BASE);`);
    }
    const run=fail=>spawnSync(process.execPath,[join(root,'scripts','build.mjs')],{env:{...process.env,FAIL_APP:fail,PAGES_BASE:'/test/'},encoding:'utf8'});
    assert.equal(run('nails').status,1);
    assert.equal(readFileSync(join(root,'dist','previous.txt'),'utf8'),'working');
    assert.equal(readdirSync(root).some(name=>name.startsWith('.build-')),false);
    assert.equal(run('').status,0);
    assert.equal(existsSync(join(root,'dist','previous.txt')),false);
    assert.equal(readFileSync(join(root,'dist','demos','nails','index.html'),'utf8'),'/test/demos/nails/');
    assert.ok(existsSync(join(root,'dist','.nojekyll')));
  } finally {rmSync(root,{recursive:true,force:true});}
});
