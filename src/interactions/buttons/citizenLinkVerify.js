const { MessageFlags } = require('discord.js');
const { startsWith } = require('../../utils/customId');
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
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const result = await robloxLinkService.verifyLinking(interaction.guild, interaction.user.id);

    if (!result.ok) {
      const canRetry = result.reason === 'code_missing' || result.reason === 'api_error';
      await interaction.editReply({
        embeds: [errorEmbed(REASON_MESSAGES[result.reason] || 'Weryfikacja nie powiodła się.')],
        components: canRetry ? [robloxLinkService.verifyButtonRow()] : [],
      });
      return;
    }

    await interaction.editReply(result.card);
  },
};
