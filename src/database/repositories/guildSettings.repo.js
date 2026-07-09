const db = require('../db');

const upsertStmt = db.prepare(`
  INSERT INTO guild_settings (guild_id, key, value, updated_at)
  VALUES (@guildId, @key, @value, @updatedAt)
  ON CONFLICT(guild_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
`);
const getStmt = db.prepare(
  'SELECT value FROM guild_settings WHERE guild_id = ? AND key = ?'
);
const allStmt = db.prepare(
  'SELECT key, value FROM guild_settings WHERE guild_id = ? ORDER BY key'
);
const deleteStmt = db.prepare(
  'DELETE FROM guild_settings WHERE guild_id = ? AND key = ?'
);

function set(guildId, key, value) {
  upsertStmt.run({ guildId, key, value, updatedAt: Date.now() });
}

function get(guildId, key) {
  const row = getStmt.get(guildId, key);
  return row ? row.value : null;
}

function getAll(guildId) {
  return allStmt.all(guildId);
}

function remove(guildId, key) {
  deleteStmt.run(guildId, key);
}

module.exports = { set, get, getAll, remove };
