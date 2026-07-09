const { startsWith } = require('../../utils/customId');
const { canManageFaction } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const factionService = require('../../services/factionService');

module.exports = {
  match: (customId) => startsWith(customId, 'faction', 'promote'),
  async execute(interaction, parts) {
    const factionId = Number(parts[2]);
    const targetId = parts[3];
    const faction = factionService.getFaction(factionId);
    if (!faction || !canManageFaction(interaction.member, faction)) {
      await interaction.reply({ embeds: [errorEmbed('Brak uprawnień lub frakcja nie istnieje.')], ephemeral: true });
      return;
    }

    const result = await factionService.changeRank(interaction.guild, factionId, targetId, 'up');
    if (!result.ok) {
      const reason = result.reason === 'no_further_rank' ? 'Ten członek ma już najwyższą rangę.' : 'Nie jest członkiem tej frakcji.';
      await interaction.reply({ embeds: [errorEmbed(reason)], ephemeral: true });
      return;
    }

    await interaction.reply({
      embeds: [successEmbed(`Awansowano <@${targetId}> do rangi **${result.newRank.name}**.`)],
    });
  },
};
