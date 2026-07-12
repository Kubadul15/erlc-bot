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

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const result = await shopService.purchaseItem(interaction.guild, interaction.user.id, itemId);
    if (!result.ok) {
      await interaction.editReply({ embeds: [errorEmbed(REASON_MESSAGES[result.reason] || 'Zakup się nie powiódł.')] });
      return;
    }

    const wallet = economyService.getWallet(interaction.guildId, interaction.user.id);
    await interaction.editReply(purchaseResultCard({ item: result.item, balance: wallet.balance }));
  },
};
