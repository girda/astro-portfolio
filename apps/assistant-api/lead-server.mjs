import { createServer } from 'node:http';
import { mkdirSync, chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createLeadStore } from './lead-store.mjs';
import { createLeadHandler } from './lead-http.mjs';

const directory = new URL('./.local-data/', import.meta.url);
mkdirSync(directory, { recursive: true, mode: 0o700 });
chmodSync(directory, 0o700);
const path = fileURLToPath(new URL('pixel-leads.sqlite', directory));
const store = createLeadStore(path);
chmodSync(path, 0o600);
const server = createServer({ requestTimeout: 10000, headersTimeout: 10000 }, createLeadHandler(store));
// Отдельный loopback-порт: публичный API и n8n Credentials не затрагиваются.
server.listen(8788, '127.0.0.1', () => console.log('Pixel local lead API: http://127.0.0.1:8788/api/leads'));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { server.close(() => { store.close(); process.exit(0); }); });
