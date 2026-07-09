const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const fineService = require('../../services/fineService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rekord')
    .setDescription('Dodaj wpis do rejestru karnego użytkownika.')
    .addUserOption((opt) => opt.setName('user').setDescription('Użytkownik').setRequired(true))
    .addStringOption((opt) => opt.setName('offense').setDescription('Wykroczenie').setRequired(true).setMaxLength(200))
    .addStringOption((opt) => opt.setName('details').setDescription('Dodatkowe szczegóły').setRequired(false).setMaxLength(1000)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const offense = interaction.options.getString('offense', true);
    const details = interaction.options.getString('details');

    const recordId = await fineService.addRecord(interaction.guild, targetUser, offense, details, interaction.user.id);
    if (!recordId) {
      await interaction.reply({ embeds: [errorEmbed('Ten użytkownik nie posiada dowodu osobistego.')], ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [successEmbed(`Dodano wpis do rejestru karnego <@${targetUser.id}>.`)] });
  },
};
