const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO ticket_messages (ticket_id, discord_id, author_tag, content, attachments, created_at)
  VALUES (@ticketId, @discordId, @authorTag, @content, @attachments, @createdAt)
`);
const listByTicketStmt = db.prepare(
  'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC'
);

function insertMany(ticketId, messages) {
  const tx = db.transaction((rows) => {
    for (const row of rows) {
      insertStmt.run({
        ticketId,
        discordId: row.discordId,
        authorTag: row.authorTag,
        content: row.content || '',
        attachments: JSON.stringify(row.attachments || []),
        createdAt: row.createdAt,
      });
    }
  });
  tx(messages);
}

function listByTicket(ticketId) {
  return listByTicketStmt.all(ticketId);
}

module.exports = { insertMany, listByTicket };
