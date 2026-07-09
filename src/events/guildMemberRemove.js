const db = require('../database/db');
const logger = require('../utils/logger');

const deleteMembershipsStmt = db.prepare('DELETE FROM faction_members WHERE discord_id = ?');

module.exports = {
  name: 'guildMemberRemove',
  execute(member) {
    try {
      deleteMembershipsStmt.run(member.id);
    } catch (err) {
      logger.error('Błąd czyszczenia członkostw frakcji po opuszczeniu serwera:', err);
    }
  },
};
