const { startsWith } = require('../../utils/customId');
const { readCategoryAnswers } = require('../../services/ticketModals');
const ticketService = require('../../services/ticketService');
const { successEmbed } = require('../../utils/embeds');
const { TICKET_CATEGORIES } = require('../../config/constants');

module.exports = {
  match: (customId) => startsWith(customId, 'ticket', 'modal'),
  async execute(interaction, parts) {
    const category = parts[2];
    if (!TICKET_CATEGORIES[category]) return;

    await interaction.deferReply({ ephemeral: true });

    const answers = readCategoryAnswers(interaction, category);
    const { channel } = await ticketService.createTicket(interaction.guild, category, interaction.user, answers);

    await interaction.editReply({
      embeds: [successEmbed(`Ticket utworzony: <#${channel.id}>`)],
    });
  },
};
