const logger = require('../utils/logger');
const env = require('../config/env');
const { memberArrivalCard } = require('../utils/cards');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    if (!env.arrivalsChannelId) return;
    try {
      const channel = await member.guild.channels.fetch(env.arrivalsChannelId);
      if (!channel) return;

      const card = memberArrivalCard({
        userId: member.id,
        tag: member.user.tag,
        avatarUrl: member.displayAvatarURL({ size: 128 }),
        accountCreatedAt: member.user.createdTimestamp,
        memberCount: member.guild.memberCount,
      });
      await channel.send(card);
    } catch (err) {
      logger.error('Błąd wysyłania ogłoszenia dołączenia (przyloty):', err);
    }
  },
};
