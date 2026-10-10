import { cart, catalog, format, demoInstructions } from './demo.mjs';
import { instructions } from './knowledge.mjs';

export class ApiError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
export function validate(body) {
  if (!body || !['de', 'en', 'ru'].includes(body.lang) || !Array.isArray(body.messages) ||
      body.messages.length < 1 || body.messages.length > 11) throw new ApiError(400, 'invalid_request');
  const mode = body.mode === undefined ? 'consult' : body.mode;
  if (!['consult', 'demo', 'brief'].includes(mode)) throw new ApiError(400, 'invalid_request');
  const messages = body.messages.map((m, i) => {
    // Строго чередуем роли; system/developer из браузера не принимаются.
    if (!m || m.role !== (i % 2 === 0 ? 'user' : 'assistant') || typeof m.content !== 'string' ||
        !m.content.trim() || m.content.length > (m.role === 'user' ? 1000 : 4000)) throw new ApiError(400, 'invalid_request');
    return { role: m.role, content: m.content.trim() };
  });
  if (messages.at(-1).role !== 'user' || messages.reduce((n, m) => n + m.content.length, 0) > 16000) throw new ApiError(400, 'invalid_request');
  return { lang: body.lang, mode, messages };
}
export async function answer(body, { apiKey, model = 'gpt-4.1-mini', fetchImpl = fetch, timeoutMs = 20000 }) {
  const { lang, mode, messages } = validate(body);
  let demoCart;
  if (mode === 'demo') { try { demoCart = cart(body.cart); } catch { throw new ApiError(400, 'invalid_cart'); } }
  if (!apiKey) throw new ApiError(503, 'not_configured');
  let response;
  try {
    response = await fetchImpl('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, instructions: instructions(lang, mode) + (mode === 'demo' ? '\n' + demoInstructions(demoCart) : ''), ...(mode === 'demo' ? { text: { format } } : {}), input: messages, max_output_tokens: mode === 'demo' ? 900 : 600, store: false }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch { throw new ApiError(502, 'upstream_unavailable'); }
  if (!response.ok) throw new ApiError(response.status === 429 ? 429 : 502, response.status === 429 ? 'rate_limited' : 'upstream_unavailable');
  let data;
  try { data = await response.json(); } catch { throw new ApiError(502, 'invalid_response'); }
  if (data.status !== 'completed' || !Array.isArray(data.output)) throw new ApiError(502, 'invalid_response');
  const text = data.output.filter(item => item.type === 'message' && item.role === 'assistant')
    .flatMap(item => Array.isArray(item.content) ? item.content : [])
    .filter(item => item.type === 'output_text' && typeof item.text === 'string').map(item => item.text).join('\n').trim();
  if (!text || text.length > 4000) throw new ApiError(502, 'invalid_response');
  if (mode === 'demo') {
    try {
      const result = JSON.parse(text);
      if (typeof result.text !== 'string' || !result.text.trim() || result.text.length > 2000) throw new Error();
      return { text: result.text, cart: cart(result.cart), catalog };
    } catch { throw new ApiError(502, 'invalid_response'); }
  }
  return { text };
}

export function createHandler({ apiKey, model, fetchImpl, limit = 20, windowMs = 60000, now = Date.now } = {}) {
  // Для локальной разработки: только разрешённые origin, общий лимит и два параллельных запроса.
  const origins = new Set(['http://localhost:4321', 'http://127.0.0.1:4321']);
  let count = 0, resetAt = 0, active = 0;
  return async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!/^((localhost|127\.0\.0\.1)(:\d+)?)$/.test(req.headers.host || '') || !origins.has(req.headers.origin)) return send(403, { error: 'forbidden' });
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.writeHead(204); return res.end();
    }
    if (req.url !== '/api/chat') return send(404, { error: 'not_found' });
    if (req.method !== 'POST') return send(405, { error: 'method_not_allowed' });
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return send(415, { error: 'invalid_content_type' });
    if (now() >= resetAt) { count = 0; resetAt = now() + windowMs; }
    if (++count > limit || active >= 2) { res.setHeader('Retry-After', '60'); return send(429, { error: 'rate_limited' }); }
    active++;
    try {
      let size = 0; const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 24000) throw new ApiError(413, 'request_too_large');
        chunks.push(chunk);
      }
      let body;
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new ApiError(400, 'invalid_request'); }
      const result = await answer(body, { apiKey, model, fetchImpl });
      send(200, result);
    } catch (error) {
      // Не выдаём клиенту сообщения upstream, ключи или содержание запроса.
      if (!res.destroyed) send(error instanceof ApiError ? error.status : 500, { error: error instanceof ApiError ? error.code : 'internal_error' });
    } finally { active--; }
  };
}
