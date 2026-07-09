const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, brandEmbed } = require('../../utils/embeds');
const moderationService = require('../../services/moderationService');
const { formatDuration } = require('../../utils/time');

const ACTION_LABELS = {
  warn: '⚠️ Ostrzeżenie',
  mute: '🔇 Wyciszenie',
  unmute: '🔇 Zdjęcie wyciszenia',
  ban: '🔨 Ban',
  unban: '🔨 Zdjęcie bana',
  kick: '👢 Wyrzucenie',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modlog')
    .setDescription('Pokaż historię moderacji użytkownika.')
    .addUserOption((opt) => opt.setName('user').setDescription('Użytkownik').setRequired(true)),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const entries = moderationService.history(interaction.guildId, targetUser.id);

    if (!entries.length) {
      await interaction.reply({ embeds: [errorEmbed('Brak historii moderacji dla tego użytkownika.')], ephemeral: true });
      return;
    }

    const lines = entries.slice(0, 15).map((e) => {
      const date = new Date(e.created_at).toLocaleString('pl-PL');
      const duration = e.duration_ms ? ` (${formatDuration(e.duration_ms)})` : '';
      return `**${ACTION_LABELS[e.action] || e.action}**${duration} — ${date}\n> ${e.reason} — <@${e.staff_discord_id}>`;
    });

    const embed = brandEmbed({
      title: `📜 Historia moderacji — <@${targetUser.id}>`,
      description: lines.join('\n\n').slice(0, 4000),
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
