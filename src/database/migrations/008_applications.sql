CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  type TEXT NOT NULL,
  faction_id INTEGER REFERENCES factions(id),
  applicant_discord_id TEXT NOT NULL,
  answers TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by_discord_id TEXT,
  reviewed_at INTEGER,
  review_reason TEXT,
  message_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_apps_applicant ON applications(applicant_discord_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(guild_id, status);
