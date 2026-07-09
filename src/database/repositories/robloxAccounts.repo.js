const db = require('../db');

const startLinkStmt = db.prepare(`
  INSERT INTO roblox_accounts (guild_id, discord_id, roblox_username, roblox_user_id, verified, verification_code, linked_at)
  VALUES (@guildId, @discordId, @robloxUsername, @robloxUserId, 0, @code, @linkedAt)
  ON CONFLICT(guild_id, discord_id) DO UPDATE SET
    roblox_username = excluded.roblox_username,
    roblox_user_id = excluded.roblox_user_id,
    verified = 0,
    verification_code = excluded.verification_code,
    linked_at = excluded.linked_at
`);
const markVerifiedStmt = db.prepare(`
  UPDATE roblox_accounts SET verified = 1, verification_code = NULL
  WHERE guild_id = ? AND discord_id = ?
`);
const getStmt = db.prepare(
  'SELECT * FROM roblox_accounts WHERE guild_id = ? AND discord_id = ?'
);

/** Rozpoczyna (lub restartuje) proces powiazania - zapisuje konto jako niezweryfikowane z nowym kodem. */
function startLink(guildId, discordId, robloxUserId, robloxUsername, code) {
  startLinkStmt.run({ guildId, discordId, robloxUsername, robloxUserId: String(robloxUserId), code, linkedAt: Date.now() });
}

function markVerified(guildId, discordId) {
  markVerifiedStmt.run(guildId, discordId);
}

function get(guildId, discordId) {
  return getStmt.get(guildId, discordId) || null;
}

module.exports = { startLink, markVerified, get };
