const { startsWith } = require('../../utils/customId');
const factionService = require('../../services/factionService');
const { errorEmbed } = require('../../utils/embeds');
const { factionInfoCard } = require('../../utils/cards');

module.exports = {
  match: (customId) => startsWith(customId, 'faction', 'directory', 'select'),
  async execute(interaction) {
    const factionId = Number(interaction.values[0]);
    const faction = factionService.getFaction(factionId);
    if (!faction) {
      await interaction.reply({ embeds: [errorEmbed('Ta frakcja już nie istnieje.')], ephemeral: true });
      return;
    }

    const ranks = factionService.listRanks(factionId);
    const members = factionService.listMembers(factionId);

    await interaction.reply({ ...factionInfoCard({ faction, ranks, members }), ephemeral: true });
  },
};
