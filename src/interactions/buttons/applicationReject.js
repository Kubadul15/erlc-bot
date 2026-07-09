const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { startsWith, build } = require('../../utils/customId');
const { isApplicationStaff } = require('../../utils/permissions');
const { errorEmbed } = require('../../utils/embeds');

module.exports = {
  match: (customId) => startsWith(customId, 'app', 'reject') && !startsWith(customId, 'app', 'reject', 'modal'),
  async execute(interaction, parts) {
    if (!isApplicationStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do rozpatrywania aplikacji.')], ephemeral: true });
      return;
    }

    const appId = parts[2];
    const modal = new ModalBuilder().setCustomId(build('app', 'reject', 'modal', appId)).setTitle('Odrzuć aplikację');

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Powód odrzucenia (opcjonalnie)')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(500)
      .setRequired(false);

    modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
    await interaction.showModal(modal);
  },
};
