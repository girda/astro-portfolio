import { LeadError } from '../portfolio/src/data/lead-contract.mjs';
export function createLeadHandler(store, { origin = 'http://localhost:4321', now = Date.now, limit = 60 } = {}) {
  let count = 0, resetAt = 0;
  return async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || '') || req.headers.origin !== origin) return send(403, { error: 'forbidden' });
    res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); res.writeHead(204); return res.end();
    }
    if (!['/api/leads/draft', '/api/leads/confirm'].includes(req.url)) return send(404, { error: 'not_found' });
    if (req.method !== 'POST') return send(405, { error: 'method_not_allowed' });
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return send(415, { error: 'invalid_content_type' });
    if (now() >= resetAt) { count = 0; resetAt = now() + 60000; }
    if (++count > limit) { res.setHeader('Retry-After', '60'); return send(429, { error: 'rate_limited' }); }
    try {
      let size = 0; const chunks = [];
      for await (const chunk of req) { size += chunk.length; if (size > 12000) throw new LeadError(413, 'request_too_large'); chunks.push(chunk); }
      let body;
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new LeadError(400, 'invalid_request'); }
      const result = req.url.endsWith('/draft') ? store.prepare(body) : store.confirm(body);
      send(200, result);
    } catch (error) {
      if (!res.destroyed) send(error instanceof LeadError ? error.status : 500, { error: error instanceof LeadError ? error.code : 'internal_error' });
    }
  };
}
