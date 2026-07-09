const { startsWith } = require('../../utils/customId');
const { showIdModal } = require('../../services/citizenModals');

module.exports = {
  match: (customId) => startsWith(customId, 'citizen', 'id', 'continue'),
  async execute(interaction) {
    await showIdModal(interaction);
  },
};
