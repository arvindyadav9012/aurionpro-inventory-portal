-- NMRC Inventory V40 Live Sync
-- Does not modify or delete existing D1 tables.
CREATE TABLE IF NOT EXISTS aurion_sync_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- CCR Gmail integration tables. Existing tables are untouched.
CREATE TABLE IF NOT EXISTS gmail_oauth (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  access_token TEXT,
  refresh_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  email TEXT,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS gmail_processed (
  message_id TEXT PRIMARY KEY,
  processed_at TEXT NOT NULL
);
