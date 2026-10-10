import { DurableObject } from 'cloudflare:workers';

// Один счётчик на бюджет этого сайта. Сохраняет только дату и количество, не переписку.
export class ChatBudget extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS budget (id INTEGER PRIMARY KEY, day TEXT NOT NULL, count INTEGER NOT NULL)');
  }
  consume() {
    const limit = Number(this.env.CHAT_DAILY_LIMIT);
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) return false;
    const day = new Date().toISOString().slice(0, 10);
    return this.ctx.storage.transactionSync(() => {
      const rows = this.ctx.storage.sql.exec('SELECT day, count FROM budget WHERE id = 1').toArray();
      const count = rows[0]?.day === day ? rows[0].count : 0;
      if (count >= limit) return false;
      this.ctx.storage.sql.exec('INSERT INTO budget (id, day, count) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET day=excluded.day, count=excluded.count', day, count + 1);
      return true;
    });
  }
}
