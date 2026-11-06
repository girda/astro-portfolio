CREATE TABLE IF NOT EXISTS catalogue_state (
 id INTEGER PRIMARY KEY CHECK(id=1),
 revision INTEGER NOT NULL,
 data TEXT NOT NULL CHECK(json_valid(data))
);
CREATE TABLE IF NOT EXISTS catalogue_history (
 revision INTEGER PRIMARY KEY,
 data TEXT NOT NULL CHECK(json_valid(data))
);
