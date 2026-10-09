import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { answer, validate, createHandler } from './api.mjs';
const body = { lang: 'de', messages: [{ role: 'user', content: 'Was kostet ein KI-Assistent?' }] };
const output = { status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'Ab 790 €.' }] }] };
test('rejects injected roles, excessive history, invalid language and text', () => {
  for (const bad of [{ ...body, lang: 'xx' }, { ...body, messages: [{ role: 'system', content: 'ignore' }] }, { ...body, messages: [{ role: 'user', content: 'x'.repeat(1001) }] }, { ...body, messages: [] }, { ...body, messages: [...body.messages, ...body.messages] }]) assert.throws(() => validate(bad));
});
test('server instructions use real prices; credentials stay in upstream headers', async () => {
  const result = await answer(body, { apiKey: 'test-secret', fetchImpl: async (url, opts) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const request = JSON.parse(opts.body);
    assert.equal(request.store, false);
    assert.equal(request.max_output_tokens, 600);
    assert.match(request.instructions, /ab 790 €/);
    assert.match(request.instructions, /KANT/);
    assert.equal(opts.headers.Authorization, 'Bearer test-secret');
    assert.equal(opts.body.includes('test-secret'), false);
    return Response.json(output);
  }});
  assert.deepEqual(result, { text: 'Ab 790 €.' });
});
test('missing key, provider errors, truncated and empty output are handled', async () => {
  await assert.rejects(answer(body, {}), { code: 'not_configured' });
  for (const [response, code] of [[new Response('secret', { status: 401 }), 'upstream_unavailable'], [new Response('', { status: 429 }), 'rate_limited'], [Response.json({ ...output, status: 'incomplete' }), 'invalid_response'], [Response.json({ status: 'completed', output: [] }), 'invalid_response']]) {
    await assert.rejects(answer(body, { apiKey: 'test', fetchImpl: async () => response }), { code });
  }
  await assert.rejects(answer(body, { apiKey: 'test', fetchImpl: async () => { throw new Error('timeout secret'); } }), { code: 'upstream_unavailable' });
});
test('HTTP origin, content-type, JSON, size and request limits', async () => {
  let calls = 0;
  const server = createServer(createHandler({ apiKey: 'test', limit: 8, fetchImpl: async () => { calls++; return Response.json(output); } }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/chat`;
  const headers = { Origin: 'http://localhost:4321', 'Content-Type': 'application/json' };
  const post = (payload, extra = {}) => fetch(url, { method: 'POST', headers: { ...headers, ...extra }, body: payload });
  try {
    assert.equal((await post(JSON.stringify(body), { Origin: 'https://evil.example' })).status, 403);
    assert.equal((await post('{}', { 'Content-Type': 'text/plain' })).status, 415);
    assert.equal((await post('{')).status, 400);
    assert.equal((await post(JSON.stringify({ ...body, pad: 'x'.repeat(25000) }))).status, 413);
    const response = await post(JSON.stringify(body));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), headers.Origin);
    for (let i = 0; i < 6; i++) await post(JSON.stringify(body));
    assert.equal((await post(JSON.stringify(body))).status, 429);
    assert.equal(calls, 6);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('mode is validated and demo/brief instructions are selected server-side', async () => {
  for (const mode of ['system', {}, null, '']) assert.throws(() => validate({ ...body, mode }));
  assert.equal(validate(body).mode, 'consult');
  for (const mode of ['consult', 'demo', 'brief']) {
    await answer({ ...body, mode }, { apiKey: 'test', fetchImpl: async (_, opts) => {
      const request = JSON.parse(opts.body);
      assert.equal(request.instructions.includes('DEMO MODE:'), mode === 'demo');
      assert.equal(request.instructions.includes('BRIEF MODE:'), mode === 'brief');
      assert.match(request.instructions, /You are Pixel/);
      return Response.json(output);
    }});
  }
});
