const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const moderationService = require('../../services/moderationService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Zdejmij wyciszenie użytkownikowi.')
    .addUserOption((opt) => opt.setName('user').setDescription('Użytkownik').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Powód').setRequired(false).setMaxLength(500)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }
    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'Brak podanego powodu.';

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      await interaction.reply({ embeds: [errorEmbed('Nie znaleziono tego użytkownika na serwerze.')], ephemeral: true });
      return;
    }

    await moderationService.unmute(interaction.guild, member, interaction.user.id, reason);
    await interaction.reply({ embeds: [successEmbed(`Zdjęto wyciszenie <@${targetUser.id}>.`)] });
  },
};
