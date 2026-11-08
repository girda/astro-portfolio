-- Старые таблицы остаются как снимок до миграции; новые запросы их больше не используют.
CREATE TABLE restaurants (
 id TEXT PRIMARY KEY,
 slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
 name TEXT NOT NULL,
 template_key TEXT NOT NULL DEFAULT 'streetfood' CHECK(template_key IN ('streetfood','diner','pizzeria')),
 locale TEXT NOT NULL DEFAULT 'de',
 currency TEXT NOT NULL DEFAULT 'EUR',
 created_at TEXT NOT NULL
);
CREATE TABLE restaurant_memberships (
 restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
 user_id TEXT NOT NULL REFERENCES cms_users(id),
 role TEXT NOT NULL CHECK(role IN ('owner','editor','viewer')),
 PRIMARY KEY(restaurant_id,user_id)
);
CREATE INDEX restaurant_memberships_user ON restaurant_memberships(user_id,restaurant_id);
CREATE TABLE restaurant_catalogues (
 restaurant_id TEXT PRIMARY KEY REFERENCES restaurants(id),
 revision INTEGER NOT NULL,
 data TEXT NOT NULL CHECK(json_valid(data))
);
CREATE TABLE restaurant_history (
 restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
 revision INTEGER NOT NULL,
 data TEXT NOT NULL CHECK(json_valid(data)),
 PRIMARY KEY(restaurant_id,revision)
);
INSERT INTO restaurants(id,slug,name,created_at)
 SELECT 'internal-demo','internal-demo','My Menu · Internal Demo',strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM catalogue_state WHERE id=1;
INSERT INTO restaurant_catalogues SELECT 'internal-demo',revision,data FROM catalogue_state WHERE id=1;
INSERT INTO restaurant_history SELECT 'internal-demo',revision,data FROM catalogue_history WHERE EXISTS(SELECT 1 FROM restaurants WHERE id='internal-demo');
-- Старые глобальные editor/viewer не становятся владельцами общего демокаталога.
INSERT INTO restaurant_memberships SELECT 'internal-demo',id,'owner' FROM cms_users WHERE id='owner-artem-hirda' AND EXISTS(SELECT 1 FROM restaurants WHERE id='internal-demo');
