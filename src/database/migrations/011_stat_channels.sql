CREATE TABLE IF NOT EXISTS stat_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  channel_id TEXT UNIQUE NOT NULL,
  stat_type TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stat_channels_guild ON stat_channels(guild_id);
