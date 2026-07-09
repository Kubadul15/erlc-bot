const db = require('../db');

const upsertStmt = db.prepare(`
  INSERT INTO roblox_accounts (guild_id, discord_id, roblox_username, linked_at)
  VALUES (@guildId, @discordId, @robloxUsername, @linkedAt)
  ON CONFLICT(guild_id, discord_id) DO UPDATE SET
    roblox_username = excluded.roblox_username,
    linked_at = excluded.linked_at
`);
const getStmt = db.prepare(
  'SELECT * FROM roblox_accounts WHERE guild_id = ? AND discord_id = ?'
);

function link(guildId, discordId, robloxUsername) {
  upsertStmt.run({ guildId, discordId, robloxUsername, linkedAt: Date.now() });
}

function get(guildId, discordId) {
  return getStmt.get(guildId, discordId) || null;
}

module.exports = { link, get };
