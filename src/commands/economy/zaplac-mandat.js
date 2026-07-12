const { SlashCommandBuilder } = require('discord.js');
const economyService = require('../../services/economyService');
const { finePaymentResultCard } = require('../../utils/cards');
const { errorEmbed } = require('../../utils/embeds');

const REASON_MESSAGES = {
  not_found: 'Nie znaleziono mandatu o takim numerze.',
  already_paid: 'Ten mandat został już opłacony.',
  not_owner: 'To nie jest Twój mandat.',
  insufficient_funds: 'Nie masz wystarczających środków, aby opłacić ten mandat.',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zaplac-mandat')
    .setDescription('Opłać mandat ze swojego portfela.')
    .addIntegerOption((o) => o.setName('id').setDescription('Numer mandatu (patrz /moje-mandaty)').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const fineId = interaction.options.getInteger('id', true);
    const result = economyService.payFine(interaction.guildId, interaction.user.id, fineId);

    if (!result.ok) {
      await interaction.reply({ embeds: [errorEmbed(REASON_MESSAGES[result.reason] || 'Nie udało się opłacić mandatu.')], ephemeral: true });
      return;
    }

    const wallet = economyService.getWallet(interaction.guildId, interaction.user.id);
    await interaction.reply(
      finePaymentResultCard({
        discordId: interaction.user.id,
        avatarUrl: interaction.user.displayAvatarURL({ size: 128 }),
        fine: result.fine,
        balance: wallet.balance,
      })
    );
  },
};
