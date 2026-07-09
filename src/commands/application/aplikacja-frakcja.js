const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embeds');
const factionService = require('../../services/factionService');
const { showApplicationModal } = require('../../services/applicationModals');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aplikacja-frakcja')
    .setDescription('Złóż aplikację do wybranej frakcji.')
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
    await showApplicationModal(interaction, 'faction', factionId);
  },
};
