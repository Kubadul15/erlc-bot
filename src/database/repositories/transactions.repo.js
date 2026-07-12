const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO transactions (guild_id, discord_id, type, amount, reason, related_discord_id, item_id, created_at)
  VALUES (@guildId, @discordId, @type, @amount, @reason, @relatedDiscordId, @itemId, @now)
`);
const listByWalletStmt = db.prepare('SELECT * FROM transactions WHERE guild_id = ? AND discord_id = ? ORDER BY created_at DESC LIMIT ?');

function record(guildId, discordId, type, amount, { reason = null, relatedDiscordId = null, itemId = null } = {}) {
  const info = insertStmt.run({ guildId, discordId, type, amount, reason, relatedDiscordId, itemId, now: Date.now() });
  return info.lastInsertRowid;
}

function listByWallet(guildId, discordId, limit = 10) {
  return listByWalletStmt.all(guildId, discordId, limit);
}

module.exports = { record, listByWallet };
