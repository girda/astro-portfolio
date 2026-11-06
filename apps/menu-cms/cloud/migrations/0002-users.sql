CREATE TABLE IF NOT EXISTS cms_users (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL UNIQUE COLLATE NOCASE,
 name TEXT NOT NULL DEFAULT '',
 role TEXT NOT NULL DEFAULT 'viewer' CHECK(role IN ('viewer','editor','super_admin')),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','blocked')),
 created_at TEXT NOT NULL,
 last_login_at TEXT,
 revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS cms_user_events (
 id TEXT PRIMARY KEY,
 actor_id TEXT NOT NULL,
 user_id TEXT NOT NULL,
 created_at TEXT NOT NULL,
 data TEXT NOT NULL CHECK(json_valid(data))
);
CREATE INDEX IF NOT EXISTS cms_users_created ON cms_users(created_at,id);
INSERT INTO cms_users(id,email,name,role,status,created_at)
VALUES ('owner-artem-hirda','artem.girda@gmail.com','Artem Hirda','super_admin','active',strftime('%Y-%m-%dT%H:%M:%fZ','now'))
ON CONFLICT(email) DO NOTHING;
