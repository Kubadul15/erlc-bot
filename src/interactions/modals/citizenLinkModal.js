const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { startsWith, build } = require('../../utils/customId');
const robloxLinkService = require('../../services/robloxLinkService');
const { errorEmbed } = require('../../utils/embeds');

module.exports = {
  match: (customId) => startsWith(customId, 'citizen', 'link', 'modal'),
  async execute(interaction) {
    const username = interaction.fields.getTextInputValue('roblox_username').trim();

    await interaction.deferReply({ ephemeral: true });

    const result = await robloxLinkService.startLinking(interaction.guildId, interaction.user.id, username);
    if (!result.ok) {
      await interaction.editReply({
        embeds: [errorEmbed('Nie znaleziono takiego użytkownika Roblox. Sprawdź pisownię i spróbuj ponownie.')],
      });
      return;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(build('citizen', 'link', 'verify'))
        .setLabel('Sprawdź ponownie')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🔄')
    );

    await interaction.editReply({ embeds: [result.embed], components: [row] });
  },
};
