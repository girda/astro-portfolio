import assert from 'node:assert/strict';
import test from 'node:test';
import { createN8nChatClient, readN8nOutput } from '../src/scripts/pixel-n8n.ts';

const endpoint = 'http://localhost:5678/webhook/example/chat';
function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
}

test('читает output объекта и массива, не принимает пустой/неверный ответ', () => {
  assert.equal(readN8nOutput({ output: 'Hallo Pixel!' }), 'Hallo Pixel!');
  assert.equal(readN8nOutput([{ output: 'Ответ из массива' }]), 'Ответ из массива');
  assert.equal(readN8nOutput([null, {}, { output: 'Найденный ответ' }]), 'Найденный ответ');
  for (const payload of [null, [], {}, { output: '' }, { output: '   ' }, { output: 42 }, { output: 'x'.repeat(4001) }]) {
    assert.throws(() => readN8nOutput(payload), /invalid_response/);
  }
});

test('отправляет точный контракт и сохраняет sessionId после пересоздания клиента', async () => {
  const storage = memoryStorage();
  const calls = [];
  const options = {
    getStorage: () => storage,
    fetcher: async (url, init) => {
      calls.push({ url, ...init, body: JSON.parse(init.body) });
      return Response.json({ output: 'Hallo!' });
    },
  };
  const first = createN8nChatClient(endpoint, options);
  assert.deepEqual(await first.send('Привет', 'consult'), { text: 'Hallo!' });
  await first.send('Ещё вопрос', 'consult');
  await createN8nChatClient(endpoint, options).send('После перезагрузки', 'consult');
  const id = calls[0].body.sessionId;
  assert.match(id, /^[0-9a-f-]{36}$/);
  assert.equal(storage.getItem('hirda.pixel.n8n.session.consult'), id);
  assert.ok(calls.every(call => call.body.sessionId === id));
  assert.deepEqual(calls[0].body, { action: 'sendMessage', sessionId: id, chatInput: 'Привет' });
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].url, endpoint);
  assert.equal(calls[0].headers['Content-Type'], 'application/json');
  assert.equal(calls[0].credentials, 'omit');
  assert.ok(calls[0].signal instanceof AbortSignal);
});

test('разделяет консультацию и демо, сбрасывает только выбранную сессию', async () => {
  const storage = memoryStorage();
  const ids = [];
  const client = createN8nChatClient(endpoint, {
    getStorage: () => storage,
    fetcher: async (_, init) => {
      ids.push(JSON.parse(init.body).sessionId);
      return Response.json([{ output: 'OK' }]);
    },
  });
  await client.send('Консультация', 'consult');
  await client.send('Демо', 'demo');
  client.resetSession('demo');
  await client.send('Новое демо', 'demo');
  await client.send('Продолжение', 'consult');
  assert.notEqual(ids[0], ids[1]);
  assert.notEqual(ids[1], ids[2]);
  assert.equal(ids[0], ids[3]);
});

test('не ломает чат при запрете sessionStorage', async () => {
  const ids = [];
  const client = createN8nChatClient(endpoint, {
    getStorage: () => { throw new DOMException('Blocked', 'SecurityError'); },
    fetcher: async (_, init) => {
      ids.push(JSON.parse(init.body).sessionId);
      return Response.json({ output: 'OK' });
    },
  });
  await client.send('Один', 'consult');
  await client.send('Два', 'consult');
  assert.equal(ids[0], ids[1]);
});

test('обрабатывает HTTP, не-JSON и сетевые ошибки', async () => {
  for (const [fetcher, error] of [
    [async () => new Response('Too many requests', { status: 429 }), /rate_limited/],
    [async () => new Response('Failed', { status: 500 }), /unavailable/],
    [async () => new Response('<html>Not JSON</html>'), /invalid_response/],
    [async () => { throw new TypeError('Network failed'); }, /Network failed/],
  ]) {
    const client = createN8nChatClient(endpoint, { getStorage: () => memoryStorage(), fetcher });
    await assert.rejects(client.send('Тест', 'consult'), error);
  }
});

test('прерывает зависший запрос по таймауту', async () => {
  const client = createN8nChatClient(endpoint, {
    getStorage: () => memoryStorage(),
    timeoutMs: 10,
    fetcher: (_, init) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(Response.json({ output: 'Поздно' })), 1000);
      init.signal.addEventListener('abort', () => { clearTimeout(timer); reject(init.signal.reason); }, { once: true });
    }),
  });
  await assert.rejects(client.send('Тест', 'consult'), { name: 'TimeoutError' });
});
