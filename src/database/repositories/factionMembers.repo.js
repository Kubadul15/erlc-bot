const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO faction_members (faction_id, discord_id, rank_id, joined_at)
  VALUES (@factionId, @discordId, @rankId, @now)
  ON CONFLICT(faction_id, discord_id) DO UPDATE SET rank_id = excluded.rank_id
`);
const getStmt = db.prepare(
  'SELECT * FROM faction_members WHERE faction_id = ? AND discord_id = ?'
);
const listByFactionStmt = db.prepare(
  'SELECT * FROM faction_members WHERE faction_id = ?'
);
const listByDiscordStmt = db.prepare(
  'SELECT * FROM faction_members WHERE discord_id = ?'
);
const setRankStmt = db.prepare(
  'UPDATE faction_members SET rank_id = ? WHERE faction_id = ? AND discord_id = ?'
);
const removeStmt = db.prepare(
  'DELETE FROM faction_members WHERE faction_id = ? AND discord_id = ?'
);

function add(factionId, discordId, rankId) {
  insertStmt.run({ factionId, discordId, rankId, now: Date.now() });
}

function get(factionId, discordId) {
  return getStmt.get(factionId, discordId) || null;
}

function listByFaction(factionId) {
  return listByFactionStmt.all(factionId);
}

function listByDiscord(discordId) {
  return listByDiscordStmt.all(discordId);
}

function setRank(factionId, discordId, rankId) {
  setRankStmt.run(rankId, factionId, discordId);
}

function remove(factionId, discordId) {
  removeStmt.run(factionId, discordId);
}

module.exports = { add, get, listByFaction, listByDiscord, setRank, remove };
