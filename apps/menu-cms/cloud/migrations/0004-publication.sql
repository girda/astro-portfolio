CREATE TABLE menu_versions (
 restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
 id TEXT NOT NULL,
 draft_revision INTEGER NOT NULL,
 data TEXT NOT NULL CHECK(json_valid(data)),
 profile TEXT NOT NULL CHECK(json_valid(profile)),
 actor_id TEXT NOT NULL,
 created_at TEXT NOT NULL,
 PRIMARY KEY(restaurant_id,id)
);
CREATE TABLE menu_publications (
 restaurant_id TEXT PRIMARY KEY REFERENCES restaurants(id),
 version_id TEXT NOT NULL,
 FOREIGN KEY(restaurant_id,version_id) REFERENCES menu_versions(restaurant_id,id)
);
CREATE INDEX menu_versions_restaurant_date ON menu_versions(restaurant_id,created_at DESC);
