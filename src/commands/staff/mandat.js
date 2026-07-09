const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const fineService = require('../../services/fineService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mandat')
    .setDescription('Wystaw mandat użytkownikowi.')
    .addUserOption((opt) => opt.setName('user').setDescription('Użytkownik').setRequired(true))
    .addIntegerOption((opt) => opt.setName('amount').setDescription('Kwota mandatu').setRequired(true).setMinValue(1))
    .addStringOption((opt) => opt.setName('reason').setDescription('Powód').setRequired(true).setMaxLength(500)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    const reason = interaction.options.getString('reason', true);

    const fineId = await fineService.issueFine(interaction.guild, targetUser, amount, reason, interaction.user.id);
    if (!fineId) {
      await interaction.reply({ embeds: [errorEmbed('Ten użytkownik nie posiada dowodu osobistego.')], ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [successEmbed(`Wystawiono mandat $${amount} dla <@${targetUser.id}>.`)] });
  },
};
