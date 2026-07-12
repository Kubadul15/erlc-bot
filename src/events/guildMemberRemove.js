const db = require('../database/db');
const logger = require('../utils/logger');
const env = require('../config/env');
const { memberDepartureCard } = require('../utils/cards');
const { formatDuration } = require('../utils/time');

const deleteMembershipsStmt = db.prepare('DELETE FROM faction_members WHERE discord_id = ?');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    try {
      deleteMembershipsStmt.run(member.id);
    } catch (err) {
      logger.error('Błąd czyszczenia członkostw frakcji po opuszczeniu serwera:', err);
    }

    if (!env.departuresChannelId) return;
    try {
      const channel = await member.guild.channels.fetch(env.departuresChannelId);
      if (!channel) return;

      const durationLabel = member.joinedTimestamp ? formatDuration(Date.now() - member.joinedTimestamp) : null;
      const card = memberDepartureCard({
        userId: member.id,
        tag: member.user?.tag ?? member.id,
        avatarUrl: member.displayAvatarURL ? member.displayAvatarURL({ size: 128 }) : null,
        memberCount: member.guild.memberCount,
        durationLabel,
      });
      await channel.send(card);
    } catch (err) {
      logger.error('Błąd wysyłania ogłoszenia opuszczenia (odloty):', err);
    }
  },
};
