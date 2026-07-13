const modActionsRepo = require('../database/repositories/modActions.repo');
const { modActionCard } = require('../utils/cards');
const { postToConfiguredChannel } = require('./configService');
const { formatDuration } = require('../utils/time');
const { dmSafe } = require('./fineService');

async function logAndAnnounce(guild, { action, targetId, staffId, reason, durationMs, ticketId }, targetUser) {
  modActionsRepo.record(guild.id, targetId, staffId, action, reason, {
    durationMs: durationMs || null,
    expiresAt: durationMs ? Date.now() + durationMs : null,
    ticketId: ticketId || null,
  });

  const card = modActionCard({
    action,
    targetId,
    staffId,
    reason,
    durationLabel: durationMs ? formatDuration(durationMs) : null,
  });

  await postToConfiguredChannel(guild, 'mod_log_channel_id', card);
  if (targetUser) await dmSafe(targetUser, card);
  return card;
}

async function warn(guild, targetUser, staffId, reason) {
  return logAndAnnounce(guild, { action: 'warn', targetId: targetUser.id, staffId, reason }, targetUser);
}

async function mute(guild, member, staffId, reason, durationMs) {
  await member.timeout(durationMs, reason);
  return logAndAnnounce(guild, { action: 'mute', targetId: member.id, staffId, reason, durationMs }, member.user);
}

async function unmute(guild, member, staffId, reason) {
  await member.timeout(null, reason);
  return logAndAnnounce(guild, { action: 'unmute', targetId: member.id, staffId, reason }, member.user);
}

async function ban(guild, user, staffId, reason, deleteMessageSeconds = 0) {
  // DM przed banem - po zbanowaniu wyslanie wiadomosci czesto juz sie nie udaje.
  const card = modActionCard({ action: 'ban', targetId: user.id, staffId, reason });
  await dmSafe(user, card);
  await guild.members.ban(user.id, { reason, deleteMessageSeconds });

  modActionsRepo.record(guild.id, user.id, staffId, 'ban', reason, {});
  await postToConfiguredChannel(guild, 'mod_log_channel_id', card);
  return card;
}

async function unban(guild, userId, staffId, reason) {
  await guild.members.unban(userId, reason);
  return logAndAnnounce(guild, { action: 'unban', targetId: userId, staffId, reason }, null);
}

async function kick(guild, member, staffId, reason) {
  const user = member.user;
  const card = modActionCard({ action: 'kick', targetId: user.id, staffId, reason });
  await dmSafe(user, card);
  await member.kick(reason);

  modActionsRepo.record(guild.id, user.id, staffId, 'kick', reason, {});
  await postToConfiguredChannel(guild, 'mod_log_channel_id', card);
  return card;
}

function history(guildId, targetId) {
  return modActionsRepo.listByTarget(guildId, targetId);
}

module.exports = { warn, mute, unmute, ban, unban, kick, history };
