const { SlashCommandBuilder } = require('discord.js');
const { canManageFaction } = require('../../utils/permissions');
const { errorEmbed } = require('../../utils/embeds');
const { factionPanelCard } = require('../../utils/cards');
const factionService = require('../../services/factionService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('frakcja-panel')
    .setDescription('Publikuje panel zarządzania członkami frakcji.')
    .addIntegerOption((o) => o.setName('faction').setDescription('Frakcja').setRequired(true).setAutocomplete(true)),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const choices = factionService
      .listFactions(interaction.guildId)
      .filter((f) => f.name.toLowerCase().includes((focused || '').toLowerCase()))
      .slice(0, 25)
      .map((f) => ({ name: f.name, value: f.id }));
    await interaction.respond(choices);
  },

  async execute(interaction) {
    const factionId = interaction.options.getInteger('faction', true);
    const faction = factionService.getFaction(factionId);
    if (!faction) {
      await interaction.reply({ embeds: [errorEmbed('Nie znaleziono frakcji.')], ephemeral: true });
      return;
    }
    if (!canManageFaction(interaction.member, faction)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do zarządzania tą frakcją.')], ephemeral: true });
      return;
    }

    const members = factionService.listMembers(factionId);
    const ranks = factionService.listRanks(factionId);

    await interaction.reply(factionPanelCard({ faction, members, ranks }));
  },
};
