CREATE TABLE IF NOT EXISTS roblox_accounts (
  guild_id TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  roblox_username TEXT NOT NULL,
  linked_at INTEGER NOT NULL,
  PRIMARY KEY (guild_id, discord_id)
);

CREATE TABLE IF NOT EXISTS citizens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  age TEXT NOT NULL,
  origin TEXT NOT NULL,
  residence TEXT NOT NULL,
  backstory TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_citizens_owner_active
  ON citizens(guild_id, discord_id)
  WHERE status = 'active';
