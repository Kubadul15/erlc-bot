const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { startsWith, build } = require('../../utils/customId');
const { canManageFaction } = require('../../utils/permissions');
const { errorEmbed, brandEmbed } = require('../../utils/embeds');
const factionService = require('../../services/factionService');

module.exports = {
  match: (customId) => startsWith(customId, 'faction', 'select-member'),
  async execute(interaction, parts) {
    const factionId = Number(parts[2]);
    const faction = factionService.getFaction(factionId);
    if (!faction) {
      await interaction.reply({ embeds: [errorEmbed('Nie znaleziono frakcji.')], ephemeral: true });
      return;
    }
    if (!canManageFaction(interaction.member, faction)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do zarządzania tą frakcją.')], ephemeral: true });
      return;
    }

    const targetId = interaction.values[0];
    const membership = factionService.listMembers(factionId).find((m) => m.discord_id === targetId);
    if (!membership) {
      await interaction.reply({ embeds: [errorEmbed('Ten użytkownik nie jest członkiem tej frakcji.')], ephemeral: true });
      return;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(build('faction', 'promote', factionId, targetId)).setLabel('Awansuj').setStyle(ButtonStyle.Success).setEmoji('⬆️'),
      new ButtonBuilder().setCustomId(build('faction', 'demote', factionId, targetId)).setLabel('Degraduj').setStyle(ButtonStyle.Secondary).setEmoji('⬇️'),
      new ButtonBuilder().setCustomId(build('faction', 'kick', factionId, targetId)).setLabel('Wyrzuć z frakcji').setStyle(ButtonStyle.Danger).setEmoji('🚪')
    );

    await interaction.reply({
      embeds: [brandEmbed({ description: `Zarządzasz członkiem <@${targetId}> we frakcji **${faction.name}**.` })],
      components: [row],
      ephemeral: true,
    });
  },
};
