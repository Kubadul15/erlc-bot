CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  citizen_id INTEGER REFERENCES citizens(id),
  make_model TEXT NOT NULL,
  plate TEXT NOT NULL,
  color TEXT,
  year TEXT,
  info TEXT,
  photo_url TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON vehicles(guild_id, discord_id);
