const { startsWith } = require('../../utils/customId');
const { isApplicationStaff } = require('../../utils/permissions');
const { errorEmbed } = require('../../utils/embeds');
const applicationService = require('../../services/applicationService');

module.exports = {
  match: (customId) => startsWith(customId, 'app', 'reject', 'modal'),
  async execute(interaction, parts) {
    if (!isApplicationStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do rozpatrywania aplikacji.')], ephemeral: true });
      return;
    }

    const appId = Number(parts[3]);
    const reason = interaction.fields.getTextInputValue('reason').trim() || null;

    const result = await applicationService.rejectApplication(interaction.guild, appId, interaction.user.id, reason, interaction.message);

    if (!result.ok) {
      await interaction.reply({ embeds: [errorEmbed('Ta aplikacja została już rozpatrzona.')], ephemeral: true });
      return;
    }

    await interaction.reply({ content: `❌ Aplikacja odrzucona przez <@${interaction.user.id}>.` });
  },
};
