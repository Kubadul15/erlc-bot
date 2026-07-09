const { startsWith } = require('../../utils/customId');
const { errorEmbed, brandEmbed } = require('../../utils/embeds');
const { isStaff } = require('../../utils/permissions');

module.exports = {
  match: (customId) => startsWith(customId, 'ticket', 'delete'),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Tylko staff może usuwać kanały ticketów.')], ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [brandEmbed({ description: '🗑️ Kanał zostanie usunięty za 5 sekund...' })] });
    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  },
};
