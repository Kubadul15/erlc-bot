const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO tickets (guild_id, channel_id, category, opener_discord_id, status, initial_data, created_at)
  VALUES (@guildId, @channelId, @category, @openerId, 'open', @initialData, @now)
`);
const getByIdStmt = db.prepare('SELECT * FROM tickets WHERE id = ?');
const getByChannelStmt = db.prepare('SELECT * FROM tickets WHERE channel_id = ?');
const claimStmt = db.prepare(
  "UPDATE tickets SET claimed_by_discord_id = ?, status = 'claimed' WHERE id = ?"
);
const closeStmt = db.prepare(
  "UPDATE tickets SET status = 'closed', closed_at = ?, closed_by_discord_id = ? WHERE id = ?"
);
const reopenStmt = db.prepare(
  "UPDATE tickets SET status = 'open', closed_at = NULL, closed_by_discord_id = NULL WHERE id = ?"
);
const countByGuildStmt = db.prepare('SELECT COUNT(*) AS n FROM tickets WHERE guild_id = ?');
const countOpenStmt = db.prepare("SELECT COUNT(*) AS n FROM tickets WHERE guild_id = ? AND status IN ('open', 'claimed')");

function create(guildId, channelId, category, openerId, initialData) {
  const info = insertStmt.run({
    guildId,
    channelId,
    category,
    openerId,
    initialData: JSON.stringify(initialData || {}),
    now: Date.now(),
  });
  return info.lastInsertRowid;
}

function getById(id) {
  return getByIdStmt.get(id) || null;
}

function getByChannel(channelId) {
  return getByChannelStmt.get(channelId) || null;
}

function claim(id, staffId) {
  claimStmt.run(staffId, id);
}

function close(id, closedById) {
  closeStmt.run(Date.now(), closedById, id);
}

function reopen(id) {
  reopenStmt.run(id);
}

function nextTicketNumber(guildId) {
  return countByGuildStmt.get(guildId).n + 1;
}

function countOpen(guildId) {
  return countOpenStmt.get(guildId).n;
}

module.exports = { create, getById, getByChannel, claim, close, reopen, nextTicketNumber, countOpen };
