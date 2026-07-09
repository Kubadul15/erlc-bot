const { startsWith } = require('../../utils/customId');
const { showLinkModal } = require('../../services/citizenModals');

module.exports = {
  match: (customId) => startsWith(customId, 'citizen', 'link', 'continue'),
  async execute(interaction) {
    await showLinkModal(interaction);
  },
};
