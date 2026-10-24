import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { LeadError, uuidPattern, validateEnvelope } from '../portfolio/src/data/lead-contract.mjs';

const confirmationLifetimeMs = 15 * 60 * 1000;
export function createLeadStore(path, { now = Date.now } = {}) {
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY, session_id TEXT NOT NULL, request_id TEXT NOT NULL,
      fields TEXT NOT NULL, token TEXT NOT NULL, expires_at INTEGER NOT NULL,
      UNIQUE(session_id, request_id)
    );
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY, draft_id TEXT NOT NULL UNIQUE REFERENCES drafts(id),
      fields TEXT NOT NULL, confirmed_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'new'
    );`);
  const readDraft = db.prepare('SELECT * FROM drafts WHERE id = ?');
  const byRequest = db.prepare('SELECT * FROM drafts WHERE session_id = ? AND request_id = ?');
  const savedLead = db.prepare('SELECT id FROM leads WHERE draft_id = ?');
  return {
    prepare(body) {
      const { sessionId, fields } = validateEnvelope(body);
      if (typeof body.requestId !== 'string' || !uuidPattern.test(body.requestId)) throw new LeadError(400, 'invalid_request');
      const encoded = createHash('sha256').update(JSON.stringify(fields)).digest('hex');
      // Уникальность в БД защищает и от двух процессов, а не только от двойного клика.
      db.prepare('INSERT INTO drafts(id, session_id, request_id, fields, token, expires_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(session_id, request_id) DO NOTHING')
        .run(randomUUID(), sessionId, body.requestId, encoded, randomBytes(32).toString('hex'), now() + confirmationLifetimeMs);
      const row = byRequest.get(sessionId, body.requestId);
      if (row.fields !== encoded) throw new LeadError(409, 'draft_changed');
      if (row.expires_at <= now()) throw new LeadError(410, 'draft_expired');
      return { draftId: row.id, token: row.token, expiresAt: row.expires_at };
    },
    confirm(body) {
      const { sessionId, fields } = validateEnvelope(body);
      if (body.confirmed !== true || typeof body.draftId !== 'string' || !uuidPattern.test(body.draftId) || typeof body.token !== 'string' || !/^[a-f0-9]{64}$/.test(body.token)) throw new LeadError(400, 'invalid_confirmation');
      db.exec('BEGIN IMMEDIATE');
      try {
        const row = readDraft.get(body.draftId);
        if (!row || row.session_id !== sessionId || !timingSafeEqual(Buffer.from(row.token), Buffer.from(body.token))) throw new LeadError(403, 'invalid_confirmation');
        if (row.fields !== createHash('sha256').update(JSON.stringify(fields)).digest('hex')) throw new LeadError(409, 'draft_changed');
        let result = savedLead.get(row.id);
        if (!result) {
          if (row.expires_at <= now()) throw new LeadError(410, 'draft_expired');
          db.prepare('INSERT INTO leads(draft_id, fields, confirmed_at) VALUES (?, ?, ?) ON CONFLICT(draft_id) DO NOTHING').run(row.id, JSON.stringify(fields), now());
          result = savedLead.get(row.id);
        }
        db.exec('COMMIT');
        return { id: result.id, status: 'saved' };
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    close() { db.close(); },
  };
}
