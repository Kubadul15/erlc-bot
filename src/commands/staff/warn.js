const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const moderationService = require('../../services/moderationService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Wystaw ostrzeżenie użytkownikowi.')
    .addUserOption((opt) => opt.setName('user').setDescription('Użytkownik').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Powód').setRequired(true).setMaxLength(500)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }
    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);

    await moderationService.warn(interaction.guild, targetUser, interaction.user.id, reason);
    await interaction.reply({ embeds: [successEmbed(`Ostrzeżenie wystawione dla <@${targetUser.id}>.`)] });
  },
};
