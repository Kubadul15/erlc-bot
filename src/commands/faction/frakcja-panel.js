const { SlashCommandBuilder, UserSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { canManageFaction } = require('../../utils/permissions');
const { errorEmbed, factionPanelEmbed } = require('../../utils/embeds');
const factionService = require('../../services/factionService');
const { build } = require('../../utils/customId');

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

    const select = new UserSelectMenuBuilder()
      .setCustomId(build('faction', 'select-member', factionId))
      .setPlaceholder('Wybierz członka do zarządzania...');

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({ embeds: [factionPanelEmbed(faction, members, ranks)], components: [row] });
  },
};
