CREATE TABLE IF NOT EXISTS factions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  color TEXT,
  role_id TEXT,
  management_role_id TEXT,
  review_channel_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS faction_ranks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  faction_id INTEGER NOT NULL REFERENCES factions(id),
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  role_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_ranks_faction ON faction_ranks(faction_id);

CREATE TABLE IF NOT EXISTS faction_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  faction_id INTEGER NOT NULL REFERENCES factions(id),
  discord_id TEXT NOT NULL,
  rank_id INTEGER NOT NULL REFERENCES faction_ranks(id),
  joined_at INTEGER NOT NULL,
  UNIQUE(faction_id, discord_id)
);

CREATE INDEX IF NOT EXISTS idx_members_discord ON faction_members(discord_id);
