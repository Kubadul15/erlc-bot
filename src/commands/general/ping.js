const { SlashCommandBuilder } = require('discord.js');
const { brandEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Sprawdź opóźnienie bota.'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [brandEmbed({ description: `🏓 Pong! Opóźnienie WebSocket: **${interaction.client.ws.ping}ms**` })],
      ephemeral: true,
    });
  },
};
