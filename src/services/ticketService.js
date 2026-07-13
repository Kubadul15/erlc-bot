const { ChannelType, PermissionsBitField } = require('discord.js');
const ticketsRepo = require('../database/repositories/tickets.repo');
const { getChannelId, getRoleId, getConfiguredChannel } = require('./configService');
const { ticketIntroCard, ticketClosedCard, ticketReopenedCard, ticketTranscriptCard } = require('../utils/cards');
const transcriptService = require('./transcriptService');
const logger = require('../utils/logger');

function ticketRoleKey(category) {
  return `ticket_role_${category}`;
}

async function createTicket(guild, category, opener, answers) {
  const number = ticketsRepo.nextTicketNumber(guild.id);
  const parentId = getChannelId(guild.id, 'ticket_parent_category_id');
  const roleId = getRoleId(guild.id, ticketRoleKey(category));

  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
    {
      id: opener.id,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.AttachFiles,
      ],
    },
  ];
  if (roleId) {
    overwrites.push({
      id: roleId,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.ManageMessages,
      ],
    });
  }

  const channel = await guild.channels.create({
    name: `ticket-${category}-${number}`,
    type: ChannelType.GuildText,
    parent: parentId || undefined,
    permissionOverwrites: overwrites,
    topic: `Ticket #${number} • kategoria: ${category} • otwarty przez ${opener.tag} (${opener.id})`,
  });

  const ticketId = ticketsRepo.create(guild.id, channel.id, category, opener.id, answers);

  const card = ticketIntroCard({ ticketId, category, openerId: opener.id, answers, pingRoleId: roleId });

  await channel.send(card);

  return { ticketId, channel };
}

async function claimTicket(ticketId, staffId, message) {
  ticketsRepo.claim(ticketId, staffId);
  const ticket = ticketsRepo.getById(ticketId);
  const roleId = getRoleId(ticket.guild_id, ticketRoleKey(ticket.category));
  const card = ticketIntroCard({
    ticketId,
    category: ticket.category,
    openerId: ticket.opener_discord_id,
    answers: JSON.parse(ticket.initial_data || '{}'),
    claimedById: staffId,
    pingRoleId: roleId,
  });
  await message.edit(card);
}

async function closeTicket(guild, ticket, channel, closedById) {
  let transcriptInfo = null;
  try {
    transcriptInfo = await transcriptService.generateAndStore(ticket.id, channel);
  } catch (err) {
    logger.error('Nie udało się wygenerować transkryptu:', err);
  }

  ticketsRepo.close(ticket.id, closedById);

  const transcriptChannel = await getConfiguredChannel(guild, 'ticket_transcript_channel_id');
  if (transcriptChannel) {
    const summaryCard = ticketTranscriptCard({
      ticketId: ticket.id,
      category: ticket.category,
      openerId: ticket.opener_discord_id,
      closedById,
      messageCount: transcriptInfo?.messageCount,
    });
    await transcriptChannel.send({ ...summaryCard, files: transcriptInfo?.attachments || [] });
  }

  // Zablokuj mozliwosc pisania dla otwierajacego, zostaw podglad historii.
  await channel.permissionOverwrites.edit(ticket.opener_discord_id, { SendMessages: false }).catch(() => {});

  await channel.send(ticketClosedCard({ ticketId: ticket.id, closedById }));
}

async function reopenTicket(ticket, channel) {
  ticketsRepo.reopen(ticket.id);
  await channel.permissionOverwrites.edit(ticket.opener_discord_id, { SendMessages: true }).catch(() => {});
  await channel.send(ticketReopenedCard());
}

module.exports = { createTicket, claimTicket, closeTicket, reopenTicket };
