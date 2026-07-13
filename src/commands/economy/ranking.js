const { SlashCommandBuilder } = require('discord.js');
const economyService = require('../../services/economyService');
const { leaderboardCard } = require('../../utils/cards');

module.exports = {
  data: new SlashCommandBuilder().setName('ranking').setDescription('Pokaż ranking najbogatszych mieszkańców.'),
  async execute(interaction) {
    const entries = economyService.leaderboard(interaction.guildId, 10);
    await interaction.reply(leaderboardCard(entries));
  },
};
