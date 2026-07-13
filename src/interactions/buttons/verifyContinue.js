const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { startsWith, parse, build } = require('../../utils/customId');

module.exports = {
  match: (customId) => startsWith(customId, 'verify', 'continue'),
  async execute(interaction) {
    const code = parse(interaction.customId)[2];

    const modal = new ModalBuilder().setCustomId(build('verify', 'submit', code)).setTitle('Weryfikacja');

    const captchaInput = new TextInputBuilder()
      .setCustomId('captcha_code')
      .setLabel('Przepisz kod z poprzedniej wiadomości')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20)
      .setRequired(true);
    const nicknameInput = new TextInputBuilder()
      .setCustomId('nickname')
      .setLabel('Pseudonim (zostanie ustawiony jako nick)')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(32)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(captchaInput),
      new ActionRowBuilder().addComponents(nicknameInput)
    );

    await interaction.showModal(modal);
  },
};
