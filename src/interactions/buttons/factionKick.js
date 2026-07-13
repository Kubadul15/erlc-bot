const { startsWith } = require('../../utils/customId');
const { canManageFaction } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const factionService = require('../../services/factionService');

module.exports = {
  match: (customId) => startsWith(customId, 'faction', 'kick'),
  async execute(interaction, parts) {
    const factionId = Number(parts[2]);
    const targetId = parts[3];
    const faction = factionService.getFaction(factionId);
    if (!faction || !canManageFaction(interaction.member, faction)) {
      await interaction.reply({ embeds: [errorEmbed('Brak uprawnień lub frakcja nie istnieje.')], ephemeral: true });
      return;
    }

    await factionService.removeMember(interaction.guild, factionId, targetId);
    await interaction.reply({ embeds: [successEmbed(`Wyrzucono <@${targetId}> z frakcji **${faction.name}**.`)] });
  },
};
