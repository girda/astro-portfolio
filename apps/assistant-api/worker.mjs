import { answer, ApiError } from './api.mjs';

// Закрытый сетевой тест: код доступа хранится в секрете, а не в сборке сайта.
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
    const send = (status, body) => Response.json(body, { status, headers });
    if (origin !== env.ALLOWED_ORIGIN) return send(403, { error: 'forbidden' });
    headers['Access-Control-Allow-Origin'] = origin;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
    if (new URL(request.url).pathname !== '/api/chat') return send(404, { error: 'not_found' });
    if (request.method !== 'POST') return send(405, { error: 'method_not_allowed' });
    if (!env.TEST_ACCESS_TOKEN || env.TEST_ACCESS_TOKEN.length < 24) return send(503, { error: 'not_configured' });
    if (!(await verifyToken(request.headers.get('Authorization') || '', `Bearer ${env.TEST_ACCESS_TOKEN}`))) return send(401, { error: 'unauthorized' });
    if (!env.CHAT_LIMITER) return send(503, { error: 'not_configured' });
    const { success } = await env.CHAT_LIMITER.limit({ key: 'hirda-private-test' });
    if (!success) return send(429, { error: 'rate_limited' });
    if (!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type') || '')) return send(415, { error: 'invalid_content_type' });
    try {
      const reader = request.body?.getReader();
      if (!reader) return send(400, { error: 'invalid_request' });
      let size = 0; const chunks = [];
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 24000) { await reader.cancel(); throw new ApiError(413, 'request_too_large'); }
          chunks.push(value);
        }
      } finally { reader.releaseLock(); }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      let body;
      try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new ApiError(400, 'invalid_request'); }
      return send(200, await answer(body, { apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL }));
    } catch (error) {
      return send(error instanceof ApiError ? error.status : 500, { error: error instanceof ApiError ? error.code : 'internal_error' });
    }
  },
};

async function verifyToken(provided, expected) {
  const encoder = new TextEncoder();
  const hashes = await Promise.all([provided, expected].map(value => crypto.subtle.digest('SHA-256', encoder.encode(value))));
  return crypto.subtle.timingSafeEqual(hashes[0], hashes[1]);
}
