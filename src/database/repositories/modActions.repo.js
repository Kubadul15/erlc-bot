const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO mod_actions
    (guild_id, target_discord_id, staff_discord_id, action, reason, duration_ms, expires_at, ticket_id, created_at)
  VALUES
    (@guildId, @targetId, @staffId, @action, @reason, @durationMs, @expiresAt, @ticketId, @now)
`);
const listByTargetStmt = db.prepare(
  'SELECT * FROM mod_actions WHERE guild_id = ? AND target_discord_id = ? ORDER BY created_at DESC'
);

function record(guildId, targetId, staffId, action, reason, { durationMs = null, expiresAt = null, ticketId = null } = {}) {
  const info = insertStmt.run({ guildId, targetId, staffId, action, reason, durationMs, expiresAt, ticketId, now: Date.now() });
  return info.lastInsertRowid;
}

function listByTarget(guildId, targetId) {
  return listByTargetStmt.all(guildId, targetId);
}

module.exports = { record, listByTarget };
