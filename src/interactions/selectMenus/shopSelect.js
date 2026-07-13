const { MessageFlags } = require('discord.js');
const { startsWith } = require('../../utils/customId');
const shopService = require('../../services/shopService');
const economyService = require('../../services/economyService');
const { purchaseResultCard } = require('../../utils/cards');
const { errorEmbed } = require('../../utils/embeds');

const REASON_MESSAGES = {
  not_found: 'Ten produkt już nie jest dostępny.',
  insufficient_funds: 'Nie masz wystarczających środków na ten zakup.',
};

module.exports = {
  match: (customId) => startsWith(customId, 'economy', 'shop', 'select'),
  async execute(interaction) {
    const itemId = Number(interaction.values[0]);

    // Defer publicznie - wynik zakupu ma byc widoczny dla kanalu. Bledy usuwamy
    // i zastepujemy prywatnym followUp, zeby nie zasmiecac kanalu "brak srodkow" itp.
    await interaction.deferReply();

    const result = await shopService.purchaseItem(interaction.guild, interaction.user.id, itemId);
    if (!result.ok) {
      await interaction.deleteReply();
      await interaction.followUp({
        embeds: [errorEmbed(REASON_MESSAGES[result.reason] || 'Zakup się nie powiódł.')],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const wallet = economyService.getWallet(interaction.guildId, interaction.user.id);
    await interaction.editReply(
      purchaseResultCard({
        discordId: interaction.user.id,
        avatarUrl: interaction.user.displayAvatarURL({ size: 128 }),
        item: result.item,
        balance: wallet.balance,
      })
    );
  },
};
