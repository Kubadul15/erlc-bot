const { startsWith } = require('../../utils/customId');
const factionService = require('../../services/factionService');
const { showApplicationModal } = require('../../services/applicationModals');
const { errorEmbed } = require('../../utils/embeds');

module.exports = {
  match: (customId) => startsWith(customId, 'application', 'faction', 'select'),
  async execute(interaction) {
    const factionId = Number(interaction.values[0]);
    const faction = factionService.getFaction(factionId);
    if (!faction) {
      await interaction.reply({ embeds: [errorEmbed('Ta frakcja już nie istnieje.')], ephemeral: true });
      return;
    }

    await showApplicationModal(interaction, 'faction', factionId);
  },
};
