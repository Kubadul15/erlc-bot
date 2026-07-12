const { SlashCommandBuilder } = require('discord.js');
const economyService = require('../../services/economyService');
const { dailyResultCard } = require('../../utils/cards');
const { errorEmbed } = require('../../utils/embeds');
const { formatDuration } = require('../../utils/time');

module.exports = {
  data: new SlashCommandBuilder().setName('nagroda-dzienna').setDescription('Odbierz swoją dzienną nagrodę.'),
  async execute(interaction) {
    const result = economyService.claimDaily(interaction.guildId, interaction.user.id);

    if (!result.ok) {
      const remaining = formatDuration(result.nextAvailableAt - Date.now());
      await interaction.reply({
        embeds: [errorEmbed(`Już odebrałeś dzisiejszą nagrodę. Wróć za: ${remaining}.`)],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply(
      dailyResultCard({
        discordId: interaction.user.id,
        avatarUrl: interaction.user.displayAvatarURL({ size: 128 }),
        amount: result.amount,
        balance: result.wallet.balance,
      })
    );
  },
};
