ALTER TABLE roblox_accounts ADD COLUMN roblox_user_id TEXT;
ALTER TABLE roblox_accounts ADD COLUMN verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE roblox_accounts ADD COLUMN verification_code TEXT;
