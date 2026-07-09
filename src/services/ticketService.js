const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ticketsRepo = require('../database/repositories/tickets.repo');
const { getChannelId, getRoleId, getConfiguredChannel } = require('./configService');
const { ticketIntroEmbed, brandEmbed } = require('../utils/embeds');
const { build } = require('../utils/customId');
const { TICKET_CATEGORIES } = require('../config/constants');
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

  const embed = ticketIntroEmbed(category, opener.id, answers);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(build('ticket', 'claim', ticketId)).setLabel('Przejmij').setStyle(ButtonStyle.Secondary).setEmoji('🙋'),
    new ButtonBuilder().setCustomId(build('ticket', 'close', ticketId)).setLabel('Zamknij').setStyle(ButtonStyle.Danger).setEmoji('🔒')
  );

  await channel.send({
    content: roleId ? `<@&${roleId}> • <@${opener.id}>` : `<@${opener.id}>`,
    embeds: [embed],
    components: [row],
  });

  return { ticketId, channel };
}

async function claimTicket(ticketId, staffId, message) {
  ticketsRepo.claim(ticketId, staffId);
  const disabledRow = ActionRowBuilder.from(message.components[0]);
  disabledRow.components[0] = ButtonBuilder.from(disabledRow.components[0])
    .setDisabled(true)
    .setLabel(`Przejęte`);
  await message.edit({ components: [disabledRow] });
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
    const meta = TICKET_CATEGORIES[ticket.category] || {};
    const summaryEmbed = brandEmbed({
      title: `${meta.emoji || '🎫'} Transkrypt ticketu #${ticket.id}`,
      fields: [
        { name: 'Kategoria', value: meta.label || ticket.category, inline: true },
        { name: 'Otwierający', value: `<@${ticket.opener_discord_id}>`, inline: true },
        { name: 'Zamknięty przez', value: `<@${closedById}>`, inline: true },
        { name: 'Wiadomości', value: String(transcriptInfo?.messageCount ?? '?'), inline: true },
      ],
    });
    await transcriptChannel.send({
      embeds: [summaryEmbed],
      files: transcriptInfo?.attachments || [],
    });
  }

  // Zablokuj mozliwosc pisania dla otwierajacego, zostaw podglad historii.
  await channel.permissionOverwrites.edit(ticket.opener_discord_id, { SendMessages: false }).catch(() => {});

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(build('ticket', 'reopen', ticket.id)).setLabel('Otwórz ponownie').setStyle(ButtonStyle.Success).setEmoji('🔓'),
    new ButtonBuilder().setCustomId(build('ticket', 'delete', ticket.id)).setLabel('Usuń kanał').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
  );
  await channel.send({
    embeds: [brandEmbed({ description: `🔒 Ticket zamknięty przez <@${closedById}>.` })],
    components: [row],
  });
}

async function reopenTicket(ticket, channel) {
  ticketsRepo.reopen(ticket.id);
  await channel.permissionOverwrites.edit(ticket.opener_discord_id, { SendMessages: true }).catch(() => {});
  await channel.send({ embeds: [brandEmbed({ description: '🔓 Ticket otwarty ponownie.' })] });
}

module.exports = { createTicket, claimTicket, closeTicket, reopenTicket };
