const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO fines (guild_id, citizen_id, issued_by_discord_id, amount, reason, status, ticket_id, created_at)
  VALUES (@guildId, @citizenId, @issuedBy, @amount, @reason, 'unpaid', @ticketId, @now)
`);
const listByCitizenStmt = db.prepare(
  'SELECT * FROM fines WHERE citizen_id = ? ORDER BY created_at DESC'
);
const sumUnpaidStmt = db.prepare(
  "SELECT COALESCE(SUM(amount), 0) AS total FROM fines WHERE citizen_id = ? AND status = 'unpaid'"
);

function issue(guildId, citizenId, issuedBy, amount, reason, ticketId = null) {
  const info = insertStmt.run({ guildId, citizenId, issuedBy, amount, reason, ticketId, now: Date.now() });
  return info.lastInsertRowid;
}

function listByCitizen(citizenId) {
  return listByCitizenStmt.all(citizenId);
}

function sumUnpaid(citizenId) {
  return sumUnpaidStmt.get(citizenId).total;
}

module.exports = { issue, listByCitizen, sumUnpaid };
