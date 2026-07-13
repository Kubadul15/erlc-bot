CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  channel_id TEXT UNIQUE,
  category TEXT NOT NULL,
  opener_discord_id TEXT NOT NULL,
  claimed_by_discord_id TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  initial_data TEXT,
  created_at INTEGER NOT NULL,
  closed_at INTEGER,
  closed_by_discord_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_tickets_opener ON tickets(opener_discord_id);
CREATE INDEX IF NOT EXISTS idx_tickets_guild_status ON tickets(guild_id, status);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id),
  discord_id TEXT NOT NULL,
  author_tag TEXT NOT NULL,
  content TEXT,
  attachments TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ticketmsgs_ticket ON ticket_messages(ticket_id);
