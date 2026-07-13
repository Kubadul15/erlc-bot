const { SlashCommandBuilder } = require('discord.js');
const citizenService = require('../../services/citizenService');
const finesRepo = require('../../database/repositories/fines.repo');
const { brandEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('moje-mandaty').setDescription('Pokaż listę swoich mandatów.'),
  async execute(interaction) {
    const citizen = citizenService.getActiveCitizen(interaction.guildId, interaction.user.id);
    if (!citizen) {
      await interaction.reply({ embeds: [errorEmbed('Nie posiadasz dowodu osobistego.')], ephemeral: true });
      return;
    }

    const fines = finesRepo.listByCitizen(citizen.id);
    if (!fines.length) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz żadnych mandatów.')], ephemeral: true });
      return;
    }

    const lines = fines
      .slice(0, 15)
      .map((f) => {
        const status = f.status === 'unpaid' ? `🔴 nieopłacony — użyj \`/zaplac-mandat id:${f.id}\`` : '🟢 opłacony';
        return `**#${f.id}** — $${f.amount} — ${f.reason}\n${status}`;
      })
      .join('\n\n');

    await interaction.reply({
      embeds: [brandEmbed({ title: '⚖️ Twoje mandaty', description: lines })],
      ephemeral: true,
    });
  },
};
