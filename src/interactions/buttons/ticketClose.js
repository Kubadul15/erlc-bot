const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { startsWith, build } = require('../../utils/customId');
const ticketsRepo = require('../../database/repositories/tickets.repo');
const { errorEmbed, brandEmbed } = require('../../utils/embeds');
const { isStaff } = require('../../utils/permissions');

module.exports = {
  match: (customId) => startsWith(customId, 'ticket', 'close') && !startsWith(customId, 'ticket', 'close', 'confirm') && !startsWith(customId, 'ticket', 'close', 'cancel'),
  async execute(interaction, parts) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Tylko staff może zamykać tickety.')], ephemeral: true });
      return;
    }

    const ticketId = Number(parts[2]);
    const ticket = ticketsRepo.getById(ticketId);
    if (!ticket) {
      await interaction.reply({ embeds: [errorEmbed('Nie znaleziono ticketu.')], ephemeral: true });
      return;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(build('ticket', 'close', 'confirm', ticketId)).setLabel('Tak, zamknij').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(build('ticket', 'close', 'cancel', ticketId)).setLabel('Anuluj').setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [brandEmbed({ description: '⚠️ Czy na pewno chcesz zamknąć ten ticket? Zostanie wygenerowany transkrypt.' })],
      components: [row],
      ephemeral: true,
    });
  },
};
