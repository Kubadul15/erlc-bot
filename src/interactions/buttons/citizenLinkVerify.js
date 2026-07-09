const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { startsWith, build } = require('../../utils/customId');
const robloxLinkService = require('../../services/robloxLinkService');
const { errorEmbed } = require('../../utils/embeds');

const REASON_MESSAGES = {
  no_pending: 'Nie masz w toku żadnej weryfikacji. Użyj `/link-roblox` albo przycisku "Powiąż konto Roblox", aby zacząć.',
  api_error: 'Nie udało się połączyć z Roblox. Spróbuj ponownie za chwilę.',
  code_missing:
    'Nie znaleziono kodu w opisie Twojego profilu Roblox. Upewnij się, że wkleiłeś go w sekcji "O mnie" i zapisałeś zmiany, a następnie spróbuj ponownie.',
};

module.exports = {
  match: (customId) => startsWith(customId, 'citizen', 'link', 'verify'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = await robloxLinkService.verifyLinking(interaction.guildId, interaction.user.id);

    if (!result.ok) {
      const retryRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(build('citizen', 'link', 'verify'))
          .setLabel('Sprawdź ponownie')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🔄')
      );
      await interaction.editReply({
        embeds: [errorEmbed(REASON_MESSAGES[result.reason] || 'Weryfikacja nie powiodła się.')],
        components: result.reason === 'code_missing' || result.reason === 'api_error' ? [retryRow] : [],
      });
      return;
    }

    const continueRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(build('citizen', 'id', 'continue'))
        .setLabel('Kontynuuj — wyrób dowód')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🪪')
    );

    await interaction.editReply({ embeds: [result.embed], components: [continueRow] });
  },
};
