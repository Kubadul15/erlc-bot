const { startsWith } = require('../../utils/customId');
const verificationService = require('../../services/verificationService');

module.exports = {
  match: (customId) => startsWith(customId, 'verify', 'start'),
  async execute(interaction) {
    const card = verificationService.startVerification();
    await interaction.reply({ ...card, ephemeral: true });
  },
};
