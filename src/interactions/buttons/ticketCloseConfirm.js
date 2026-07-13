const { startsWith } = require('../../utils/customId');
const ticketsRepo = require('../../database/repositories/tickets.repo');
const ticketService = require('../../services/ticketService');
const { errorEmbed, brandEmbed } = require('../../utils/embeds');
const { isStaff } = require('../../utils/permissions');

module.exports = {
  match: (customId) => startsWith(customId, 'ticket', 'close', 'confirm') || startsWith(customId, 'ticket', 'close', 'cancel'),
  async execute(interaction, parts) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Tylko staff może zamykać tickety.')], ephemeral: true });
      return;
    }

    const action = parts[2]; // confirm | cancel
    const ticketId = Number(parts[3]);

    if (action === 'cancel') {
      await interaction.update({ embeds: [brandEmbed({ description: 'Anulowano zamykanie ticketu.' })], components: [] });
      return;
    }

    const ticket = ticketsRepo.getById(ticketId);
    if (!ticket) {
      await interaction.update({ embeds: [errorEmbed('Nie znaleziono ticketu.')], components: [] });
      return;
    }

    await interaction.update({ embeds: [brandEmbed({ description: '⏳ Zamykanie ticketu i generowanie transkryptu...' })], components: [] });
    await ticketService.closeTicket(interaction.guild, ticket, interaction.channel, interaction.user.id);
  },
};
