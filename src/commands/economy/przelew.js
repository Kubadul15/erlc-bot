const { SlashCommandBuilder } = require('discord.js');
const economyService = require('../../services/economyService');
const { payResultCard } = require('../../utils/cards');
const { errorEmbed } = require('../../utils/embeds');

const REASON_MESSAGES = {
  self: 'Nie możesz przelać pieniędzy samemu sobie.',
  invalid_amount: 'Kwota musi być większa od zera.',
  insufficient_funds: 'Nie masz wystarczających środków.',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('przelew')
    .setDescription('Przelej pieniądze innemu użytkownikowi.')
    .addUserOption((o) => o.setName('user').setDescription('Odbiorca').setRequired(true))
    .addIntegerOption((o) => o.setName('kwota').setDescription('Kwota').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('kwota', true);

    if (target.bot) {
      await interaction.reply({ embeds: [errorEmbed('Nie możesz przelać pieniędzy botowi.')], ephemeral: true });
      return;
    }

    const result = economyService.pay(interaction.guildId, interaction.user.id, target.id, amount);
    if (!result.ok) {
      await interaction.reply({ embeds: [errorEmbed(REASON_MESSAGES[result.reason] || 'Przelew się nie powiódł.')], ephemeral: true });
      return;
    }

    await interaction.reply(
      payResultCard({
        fromId: interaction.user.id,
        toId: target.id,
        avatarUrl: interaction.user.displayAvatarURL({ size: 128 }),
        amount,
        balance: result.senderWallet.balance,
      })
    );
  },
};
