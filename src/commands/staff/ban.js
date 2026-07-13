const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const moderationService = require('../../services/moderationService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Zbanuj użytkownika.')
    .addUserOption((opt) => opt.setName('user').setDescription('Użytkownik').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Powód').setRequired(true).setMaxLength(500))
    .addIntegerOption((opt) =>
      opt.setName('delete_days').setDescription('Usuń wiadomości z ilu dni (0-7)').setRequired(false).setMinValue(0).setMaxValue(7)
    ),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }
    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const deleteDays = interaction.options.getInteger('delete_days') || 0;

    await moderationService.ban(interaction.guild, targetUser, interaction.user.id, reason, deleteDays * 24 * 60 * 60);
    await interaction.reply({ embeds: [successEmbed(`Zbanowano <@${targetUser.id}>.`)] });
  },
};
