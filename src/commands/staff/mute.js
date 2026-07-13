const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const moderationService = require('../../services/moderationService');
const { parseDuration } = require('../../utils/time');
const { MAX_TIMEOUT_MS } = require('../../config/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Wycisz użytkownika (timeout, maks. 28 dni).')
    .addUserOption((opt) => opt.setName('user').setDescription('Użytkownik').setRequired(true))
    .addStringOption((opt) => opt.setName('duration').setDescription('Czas trwania, np. 10m, 2h, 1d (maks. 28d)').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Powód').setRequired(true).setMaxLength(500)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const durationInput = interaction.options.getString('duration', true);
    const reason = interaction.options.getString('reason', true);

    const durationMs = parseDuration(durationInput);
    if (!durationMs) {
      await interaction.reply({ embeds: [errorEmbed('Niepoprawny format czasu. Użyj np. 10m, 2h, 1d.')], ephemeral: true });
      return;
    }
    if (durationMs > MAX_TIMEOUT_MS) {
      await interaction.reply({ embeds: [errorEmbed('Maksymalny czas wyciszenia to 28 dni.')], ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      await interaction.reply({ embeds: [errorEmbed('Nie znaleziono tego użytkownika na serwerze.')], ephemeral: true });
      return;
    }

    await moderationService.mute(interaction.guild, member, interaction.user.id, reason, durationMs);
    await interaction.reply({ embeds: [successEmbed(`Wyciszono <@${targetUser.id}>.`)] });
  },
};
