const { SlashCommandBuilder } = require('discord.js');
const economyService = require('../../services/economyService');
const transactionsRepo = require('../../database/repositories/transactions.repo');
const { walletCard } = require('../../utils/cards');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('saldo')
    .setDescription('Sprawdź saldo portfela.')
    .addUserOption((o) => o.setName('user').setDescription('Użytkownik (domyślnie Ty)').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const wallet = economyService.getWallet(interaction.guildId, target.id);
    const recentTransactions = transactionsRepo.listByWallet(interaction.guildId, target.id, 5);

    const card = walletCard({
      discordId: target.id,
      avatarUrl: target.displayAvatarURL({ size: 128 }),
      balance: wallet.balance,
      recentTransactions,
    });
    await interaction.reply(card);
  },
};
