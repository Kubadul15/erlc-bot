const { startsWith } = require('../../utils/customId');
const { showCategoryModal } = require('../../services/ticketModals');

module.exports = {
  match: (customId) => startsWith(customId, 'ticket', 'category', 'select'),
  async execute(interaction) {
    const category = interaction.values[0];
    await showCategoryModal(interaction, category);
  },
};
