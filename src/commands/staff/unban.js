const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const moderationService = require('../../services/moderationService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Zdejmij bana użytkownikowi po ID.')
    .addStringOption((opt) => opt.setName('user_id').setDescription('ID użytkownika Discord').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Powód').setRequired(false).setMaxLength(500)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }
    const userId = interaction.options.getString('user_id', true).trim();
    const reason = interaction.options.getString('reason') || 'Brak podanego powodu.';

    try {
      await moderationService.unban(interaction.guild, userId, interaction.user.id, reason);
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('Nie udało się zdjąć bana. Sprawdź poprawność ID.')], ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [successEmbed(`Zdjęto bana <@${userId}>.`)] });
  },
};
