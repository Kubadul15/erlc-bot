const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO stat_channels (guild_id, channel_id, stat_type, created_at)
  VALUES (@guildId, @channelId, @statType, @now)
`);
const listByGuildStmt = db.prepare('SELECT * FROM stat_channels WHERE guild_id = ?');
const listGuildIdsStmt = db.prepare('SELECT DISTINCT guild_id FROM stat_channels');
const getByGuildAndTypeStmt = db.prepare('SELECT * FROM stat_channels WHERE guild_id = ? AND stat_type = ?');
const removeStmt = db.prepare('DELETE FROM stat_channels WHERE channel_id = ?');

function create(guildId, channelId, statType) {
  insertStmt.run({ guildId, channelId, statType, now: Date.now() });
}

function listByGuild(guildId) {
  return listByGuildStmt.all(guildId);
}

function listGuildIds() {
  return listGuildIdsStmt.all().map((row) => row.guild_id);
}

function getByGuildAndType(guildId, statType) {
  return getByGuildAndTypeStmt.get(guildId, statType) || null;
}

function remove(channelId) {
  removeStmt.run(channelId);
}

module.exports = { create, listByGuild, listGuildIds, getByGuildAndType, remove };
