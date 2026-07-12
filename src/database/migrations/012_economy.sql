CREATE TABLE IF NOT EXISTS wallets (
  guild_id TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  last_daily_at INTEGER,
  last_work_at INTEGER,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (guild_id, discord_id)
);

CREATE TABLE IF NOT EXISTS shop_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  role_id TEXT,
  emoji TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shop_items_guild ON shop_items(guild_id, active);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  related_discord_id TEXT,
  item_id INTEGER REFERENCES shop_items(id),
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(guild_id, discord_id);
