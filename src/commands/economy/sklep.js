const { SlashCommandBuilder } = require('discord.js');
const shopService = require('../../services/shopService');
const { shopCard } = require('../../utils/cards');

module.exports = {
  data: new SlashCommandBuilder().setName('sklep').setDescription('Otwórz sklep serwera.'),
  async execute(interaction) {
    const items = shopService.listItems(interaction.guildId);
    await interaction.reply(shopCard(items));
  },
};
