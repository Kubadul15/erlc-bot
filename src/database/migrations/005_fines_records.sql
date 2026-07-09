CREATE TABLE IF NOT EXISTS fines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  citizen_id INTEGER NOT NULL REFERENCES citizens(id),
  issued_by_discord_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  ticket_id INTEGER REFERENCES tickets(id),
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fines_citizen ON fines(citizen_id);

CREATE TABLE IF NOT EXISTS criminal_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  citizen_id INTEGER NOT NULL REFERENCES citizens(id),
  issued_by_discord_id TEXT NOT NULL,
  offense TEXT NOT NULL,
  details TEXT,
  ticket_id INTEGER REFERENCES tickets(id),
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_citizen ON criminal_records(citizen_id);
