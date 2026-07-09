const { SlashCommandBuilder } = require('discord.js');
const { showApplicationModal } = require('../../services/applicationModals');

module.exports = {
  data: new SlashCommandBuilder().setName('aplikacja-staff').setDescription('Złóż aplikację do zespołu staffu.'),
  async execute(interaction) {
    await showApplicationModal(interaction, 'staff');
  },
};
