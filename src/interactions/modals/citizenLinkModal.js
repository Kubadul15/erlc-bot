const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { startsWith, build } = require('../../utils/customId');
const citizenService = require('../../services/citizenService');
const { successEmbed } = require('../../utils/embeds');

module.exports = {
  match: (customId) => startsWith(customId, 'citizen', 'link', 'modal'),
  async execute(interaction) {
    const username = interaction.fields.getTextInputValue('roblox_username').trim();
    citizenService.linkRoblox(interaction.guildId, interaction.user.id, username);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(build('citizen', 'id', 'continue'))
        .setLabel('Kontynuuj — wyrób dowód')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🪪')
    );

    await interaction.reply({
      embeds: [successEmbed(`Powiązano konto Roblox: **${username}**. Kliknij poniżej, aby kontynuować.`)],
      components: [row],
      ephemeral: true,
    });
  },
};
