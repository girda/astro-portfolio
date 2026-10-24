import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { DatabaseSync } from 'node:sqlite';
import { createLeadStore } from './lead-store.mjs';
import { createLeadHandler } from './lead-http.mjs';
import { validateLead } from '../portfolio/src/data/lead-contract.mjs';
const fields = { name: 'Pixel QA', contact: 'pixel-test@example.com', requirements: 'Website für Gartenpflege', budget: '' };
const body = () => ({ sessionId: randomUUID(), requestId: randomUUID(), scope: 'consult', fields });
const confirmation = (input, draft) => ({ ...input, ...draft, confirmed: true });

test('данные и режим проверяются независимо от ответа модели', () => {
  assert.deepEqual(validateLead(fields), fields);
  assert.equal(validateLead({ ...fields, contact: '+49 176 76429272' }).contact, '+49 176 76429272');
  for (const value of [null, {}, { ...fields, name: '' }, { ...fields, contact: 'not-a-contact' }, { ...fields, contact: '+123' }, { ...fields, requirements: 'short' }, { ...fields, budget: 500 }, { ...fields, name: 'x'.repeat(101) }]) assert.throws(() => validateLead(value));
  const store = createLeadStore(':memory:');
  try { for (const scope of ['demo', 'brief', '', undefined]) assert.throws(() => store.prepare({ ...body(), scope })); } finally { store.close(); }
});
test('без подтверждения нет заявки; повтор подтверждения возвращает тот же id', () => {
  const store = createLeadStore(':memory:');
  try {
    const input = body(), draft = store.prepare(input);
    assert.deepEqual(store.prepare(input), draft);
    assert.throws(() => store.confirm({ ...input, ...draft }), { code: 'invalid_confirmation' });
    const saved = store.confirm(confirmation(input, draft));
    assert.equal(saved.id, 1); assert.equal(saved.status, 'saved');
    assert.deepEqual(store.confirm(confirmation(input, draft)), saved);
    assert.throws(() => store.confirm({ ...confirmation(input, draft), sessionId: randomUUID() }), { code: 'invalid_confirmation' });
    assert.throws(() => store.confirm({ ...confirmation(input, draft), token: '0'.repeat(64) }), { code: 'invalid_confirmation' });
    assert.throws(() => store.confirm({ ...confirmation(input, draft), fields: { ...fields, budget: '900 Euro' } }), { code: 'draft_changed' });
  } finally { store.close(); }
});
test('срок подтверждения и повтор после потери ответа; данные не хранятся до согласия', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'pixel-lead-test-')), 'leads.sqlite');
  let time = 1000; const store = createLeadStore(path, { now: () => time });
  try {
    const input = body(), draft = store.prepare(input);
    const db = new DatabaseSync(path);
    assert.equal(db.prepare('SELECT count(*) AS count FROM leads').get().count, 0);
    assert.equal(db.prepare('SELECT fields FROM drafts').get().fields.includes('Pixel QA'), false);
    assert.throws(() => store.prepare({ ...input, fields: { ...fields, budget: '800' } }), { code: 'draft_changed' });
    time += 16 * 60000;
    assert.throws(() => store.confirm(confirmation(input, draft)), { code: 'draft_expired' });
    const second = body(), ready = store.prepare(second), saved = store.confirm(confirmation(second, ready));
    time += 16 * 60000;
    assert.deepEqual(store.confirm(confirmation(second, ready)), saved);
    assert.equal(db.prepare('SELECT count(*) AS count FROM leads').get().count, 1);
    db.close();
  } finally { store.close(); }
  const reopened = createLeadStore(path);
  reopened.close();
});
test('два параллельных процесса подтверждают одну заявку ровно один раз', async () => {
  const path = join(mkdtempSync(join(tmpdir(), 'pixel-lead-race-')), 'leads.sqlite');
  const store = createLeadStore(path); const input = body(), draft = store.prepare(input); store.close();
  const moduleUrl = new URL('./lead-store.mjs', import.meta.url).href;
  const run = () => new Promise((resolve, reject) => {
    const source = `import { parentPort, workerData } from 'node:worker_threads'; import { createLeadStore } from ${JSON.stringify(moduleUrl)}; const store=createLeadStore(workerData.path); parentPort.postMessage(store.confirm(workerData.body)); store.close();`;
    const worker = new Worker(new URL('data:text/javascript,' + encodeURIComponent(source)), { workerData: { path, body: confirmation(input, draft) } });
    let result; worker.once('message', value => { result = value; }); worker.once('error', reject); worker.once('exit', code => code === 0 ? resolve(result) : reject(new Error('worker_failed')));
  });
  const results = await Promise.all([run(), run()]); assert.deepEqual(results[0], results[1]);
  const db = new DatabaseSync(path); assert.equal(db.prepare('SELECT count(*) AS count FROM leads').get().count, 1); db.close();
});
test('HTTP: origin, JSON, размер, ошибки, подтверждение и лимит', async () => {
  const store = createLeadStore(':memory:'); const server = createServer(createLeadHandler(store, { limit: 10 }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/leads`;
  const post = (path, payload, extra = {}) => fetch(url + path, { method: 'POST', headers: { Origin: 'http://localhost:4321', 'Content-Type': 'application/json', ...extra }, body: typeof payload === 'string' ? payload : JSON.stringify(payload) });
  try {
    assert.equal((await post('/draft', body(), { Origin: 'https://evil.example' })).status, 403);
    assert.equal((await post('/draft', body(), { 'Content-Type': 'text/plain' })).status, 415);
    assert.equal((await post('/draft', '{')).status, 400);
    assert.equal((await post('/draft', { pad: 'x'.repeat(12001) })).status, 413);
    const input = body(), response = await post('/draft', input), draft = await response.json(); assert.equal(response.status, 200);
    assert.equal((await post('/confirm', { ...input, ...draft })).status, 400);
    const saved = await (await post('/confirm', confirmation(input, draft))).json(); assert.equal(saved.id, 1);
    assert.deepEqual(await (await post('/confirm', confirmation(input, draft))).json(), saved);
    for (let i = 0; i < 4; i++) await post('/draft', body());
    assert.equal((await post('/draft', body())).status, 429);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); store.close(); }
});
