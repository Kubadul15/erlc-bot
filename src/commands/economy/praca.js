const { SlashCommandBuilder } = require('discord.js');
const economyService = require('../../services/economyService');
const { workResultCard } = require('../../utils/cards');
const { errorEmbed } = require('../../utils/embeds');
const { formatDuration } = require('../../utils/time');

module.exports = {
  data: new SlashCommandBuilder().setName('praca').setDescription('Popracuj i zarób trochę pieniędzy.'),
  async execute(interaction) {
    const result = economyService.work(interaction.guildId, interaction.user.id);

    if (!result.ok) {
      const remaining = formatDuration(result.nextAvailableAt - Date.now());
      await interaction.reply({
        embeds: [errorEmbed(`Musisz odpocząć przed kolejną pracą. Wróć za: ${remaining}.`)],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      ...workResultCard({ amount: result.amount, flavorText: result.flavorText, balance: result.wallet.balance }),
      ephemeral: true,
    });
  },
};
