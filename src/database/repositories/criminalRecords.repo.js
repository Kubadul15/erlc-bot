const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO criminal_records (guild_id, citizen_id, issued_by_discord_id, offense, details, ticket_id, created_at)
  VALUES (@guildId, @citizenId, @issuedBy, @offense, @details, @ticketId, @now)
`);
const listByCitizenStmt = db.prepare(
  'SELECT * FROM criminal_records WHERE citizen_id = ? ORDER BY created_at DESC'
);

function add(guildId, citizenId, issuedBy, offense, details = null, ticketId = null) {
  const info = insertStmt.run({ guildId, citizenId, issuedBy, offense, details, ticketId, now: Date.now() });
  return info.lastInsertRowid;
}

function listByCitizen(citizenId) {
  return listByCitizenStmt.all(citizenId);
}

module.exports = { add, listByCitizen };
