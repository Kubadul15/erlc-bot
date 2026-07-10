const { MessageFlags } = require('discord.js');
const { startsWith } = require('../../utils/customId');
const robloxLinkService = require('../../services/robloxLinkService');
const { errorEmbed } = require('../../utils/embeds');

module.exports = {
  match: (customId) => startsWith(customId, 'citizen', 'link', 'modal'),
  async execute(interaction) {
    const username = interaction.fields.getTextInputValue('roblox_username').trim();

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const result = await robloxLinkService.startLinking(interaction.guildId, interaction.user.id, username);
    if (!result.ok) {
      await interaction.editReply({
        embeds: [errorEmbed('Nie znaleziono takiego użytkownika Roblox. Sprawdź pisownię i spróbuj ponownie.')],
      });
      return;
    }

    await interaction.editReply(result.card);
  },
};
