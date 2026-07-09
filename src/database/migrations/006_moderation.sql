CREATE TABLE IF NOT EXISTS mod_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  target_discord_id TEXT NOT NULL,
  staff_discord_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  duration_ms INTEGER,
  expires_at INTEGER,
  ticket_id INTEGER REFERENCES tickets(id),
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_modactions_target ON mod_actions(target_discord_id);
