const { startsWith } = require('../../utils/customId');
const shopService = require('../../services/shopService');
const { shopCard } = require('../../utils/cards');

module.exports = {
  match: (customId) => startsWith(customId, 'economy', 'shop', 'open'),
  async execute(interaction) {
    const items = shopService.listItems(interaction.guildId);
    await interaction.reply(shopCard(items));
  },
};
