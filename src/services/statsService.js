const statChannelsRepo = require('../database/repositories/statChannels.repo');
const citizensRepo = require('../database/repositories/citizens.repo');
const ticketsRepo = require('../database/repositories/tickets.repo');
const { STAT_TYPES } = require('../config/constants');
const logger = require('../utils/logger');

async function computeStatValue(guild, statType) {
  switch (statType) {
    case 'members': {
      const fetched = await guild.fetch().catch(() => null);
      return fetched?.approximateMemberCount ?? guild.memberCount ?? 0;
    }
    case 'online': {
      const fetched = await guild.fetch().catch(() => null);
      return fetched?.approximatePresenceCount ?? 0;
    }
    case 'citizens':
      return citizensRepo.countActive(guild.id);
    case 'tickets_open':
      return ticketsRepo.countOpen(guild.id);
    default:
      return 0;
  }
}

function buildChannelName(statType, value) {
  const meta = STAT_TYPES[statType];
  if (!meta) return null;
  return `${meta.emoji} ${meta.label}: ${value}`.slice(0, 100);
}

async function updateGuildStatChannels(guild) {
  const rows = statChannelsRepo.listByGuild(guild.id);
  for (const row of rows) {
    const channel = await guild.channels.fetch(row.channel_id).catch(() => null);
    if (!channel) {
      statChannelsRepo.remove(row.channel_id); // kanal zostal usuniety recznie - czyscimy wpis
      continue;
    }

    const value = await computeStatValue(guild, row.stat_type);
    const newName = buildChannelName(row.stat_type, value);
    if (newName && channel.name !== newName) {
      await channel.setName(newName).catch((err) => logger.warn(`Nie udało się zaktualizować kanału statystyk ${row.channel_id}:`, err.message));
    }
  }
}

async function updateAllStatChannels(client) {
  for (const guildId of statChannelsRepo.listGuildIds()) {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) continue;
    await updateGuildStatChannels(guild).catch((err) => logger.error(`Błąd aktualizacji statystyk dla ${guildId}:`, err));
  }
}

module.exports = { computeStatValue, buildChannelName, updateGuildStatChannels, updateAllStatChannels };
