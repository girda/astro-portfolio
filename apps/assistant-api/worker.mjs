import { verifyTurnstile } from './turnstile.mjs';
export { ChatBudget } from './budget.mjs';
import { answer, ApiError, validate } from './api.mjs';

// Публичный чат: Turnstile, лимит IP и общий устойчивый дневной бюджет.
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
    if (!env.TURNSTILE_SECRET || !env.CHAT_LIMITER || !env.CHAT_BUDGET) return send(503, { error: 'not_configured' });
    const ip = request.headers.get('CF-Connecting-IP');
    if (!ip) return send(403, { error: 'forbidden' });
    const { success } = await env.CHAT_LIMITER.limit({ key: ip });
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
      validate(body);
      const verified = await verifyTurnstile(body.turnstileToken, { secret: env.TURNSTILE_SECRET, hostname: 'girda.github.io', ip });
      if (!verified) return send(403, { error: 'verification_failed' });
      if (!(await env.CHAT_BUDGET.getByName('pixel-site-budget').consume())) return send(429, { error: 'daily_limit' });
      return send(200, await answer(body, { apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL }));
    } catch (error) {
      return send(error instanceof ApiError ? error.status : 500, { error: error instanceof ApiError ? error.code : 'internal_error' });
    }
  },
};
