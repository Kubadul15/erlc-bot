const { startsWith } = require('../../utils/customId');
const ticketsRepo = require('../../database/repositories/tickets.repo');
const ticketService = require('../../services/ticketService');
const { errorEmbed } = require('../../utils/embeds');
const { isStaff } = require('../../utils/permissions');

module.exports = {
  match: (customId) => startsWith(customId, 'ticket', 'claim'),
  async execute(interaction, parts) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Tylko staff może przejmować tickety.')], ephemeral: true });
      return;
    }

    const ticketId = Number(parts[2]);
    const ticket = ticketsRepo.getById(ticketId);
    if (!ticket) {
      await interaction.reply({ embeds: [errorEmbed('Nie znaleziono ticketu.')], ephemeral: true });
      return;
    }

    await ticketService.claimTicket(ticketId, interaction.user.id, interaction.message);
    await interaction.reply({ content: `🙋 Ticket przejęty przez <@${interaction.user.id}>.` });
  },
};
