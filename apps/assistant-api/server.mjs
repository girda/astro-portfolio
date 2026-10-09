import { createServer } from 'node:http';
import { createHandler } from './api.mjs';
const port = Number(process.env.PORT || 8787);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid PORT');
const server = createServer({ requestTimeout: 10000, headersTimeout: 10000 }, createHandler({
  apiKey: process.env.OPENAI_API_KEY?.trim(), model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
}));
server.listen(port, '127.0.0.1', () => {
  console.log(`HIRDA CAT local API: http://127.0.0.1:${port}`);
  console.log(process.env.OPENAI_API_KEY?.trim() ? 'API key configured (not yet verified).' : 'Add OPENAI_API_KEY to apps/assistant-api/.env and restart.');
});
