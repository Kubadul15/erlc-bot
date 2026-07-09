const { startsWith } = require('../../utils/customId');
const { readApplicationAnswers } = require('../../services/applicationModals');
const applicationService = require('../../services/applicationService');
const factionService = require('../../services/factionService');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  match: (customId) => startsWith(customId, 'app', 'modal'),
  async execute(interaction, parts) {
    const type = parts[2]; // staff | faction

    await interaction.deferReply({ ephemeral: true });

    const answers = readApplicationAnswers(interaction, type);

    let faction = null;
    if (type === 'faction') {
      const factionId = Number(parts[3]);
      faction = factionService.getFaction(factionId);
      if (!faction) {
        await interaction.editReply({ embeds: [errorEmbed('Ta frakcja już nie istnieje.')] });
        return;
      }
    }

    await applicationService.submitApplication(interaction.guild, type, interaction.user, answers, faction);

    await interaction.editReply({ embeds: [successEmbed('Twoja aplikacja została wysłana. Poczekaj na decyzję staffu.')] });
  },
};
