const guildSettings = require('../database/repositories/guildSettings.repo');
const { postToConfiguredChannel, getRoleId } = require('./configService');
const { rpStartCard, rpStopCard } = require('../utils/cards');
const { formatDuration } = require('../utils/time');

function isActive(guildId) {
  return guildSettings.get(guildId, 'rp_session_active') === '1';
}

async function startSession(guild, staffId, code) {
  guildSettings.set(guild.id, 'rp_session_active', '1');
  guildSettings.set(guild.id, 'rp_session_started_at', String(Date.now()));

  const roleId = getRoleId(guild.id, 'role_rp_ping');
  const card = rpStartCard({ staffId, code, pingRoleId: roleId });
  const message = await postToConfiguredChannel(guild, 'rp_announce_channel_id', card);
  return { ok: true, message };
}

async function stopSession(guild, staffId) {
  const startedAtRaw = guildSettings.get(guild.id, 'rp_session_started_at');
  const durationLabel = startedAtRaw ? formatDuration(Date.now() - Number(startedAtRaw)) : null;

  guildSettings.set(guild.id, 'rp_session_active', '0');

  const card = rpStopCard({ staffId, durationLabel });
  const message = await postToConfiguredChannel(guild, 'rp_announce_channel_id', card);
  return { ok: true, message };
}

module.exports = { isActive, startSession, stopSession };
