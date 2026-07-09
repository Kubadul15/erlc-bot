const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO applications (guild_id, type, faction_id, applicant_discord_id, answers, status, created_at)
  VALUES (@guildId, @type, @factionId, @applicantId, @answers, 'pending', @now)
`);
const getByIdStmt = db.prepare('SELECT * FROM applications WHERE id = ?');
const setMessageIdStmt = db.prepare('UPDATE applications SET message_id = ? WHERE id = ?');
const decideStmt = db.prepare(`
  UPDATE applications SET
    status = @status,
    reviewed_by_discord_id = @reviewerId,
    reviewed_at = @now,
    review_reason = @reason
  WHERE id = @id
`);

function create(guildId, type, applicantId, answers, factionId = null) {
  const info = insertStmt.run({
    guildId,
    type,
    factionId,
    applicantId,
    answers: JSON.stringify(answers),
    now: Date.now(),
  });
  return info.lastInsertRowid;
}

function getById(id) {
  return getByIdStmt.get(id) || null;
}

function setMessageId(id, messageId) {
  setMessageIdStmt.run(messageId, id);
}

function decide(id, status, reviewerId, reason = null) {
  decideStmt.run({ id, status, reviewerId, reason, now: Date.now() });
}

module.exports = { create, getById, setMessageId, decide };
