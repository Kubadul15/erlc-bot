const citizensRepo = require('../database/repositories/citizens.repo');
const robloxRepo = require('../database/repositories/robloxAccounts.repo');
const finesRepo = require('../database/repositories/fines.repo');
const recordsRepo = require('../database/repositories/criminalRecords.repo');
const { citizenIdCard } = require('../utils/cards');
const { postToConfiguredChannel, CONFIG_KEYS } = require('./configService');
const env = require('../config/env');

/** Zwraca powiazane konto Roblox tylko jesli zostalo zweryfikowane, w przeciwnym razie null. */
function getVerifiedRoblox(guildId, discordId) {
  const row = robloxRepo.get(guildId, discordId);
  return row?.verified ? row : null;
}

function getActiveCitizen(guildId, discordId) {
  return citizensRepo.getActive(guildId, discordId);
}

async function createCitizen(guild, discordId, data) {
  const citizen = citizensRepo.createOrReplace(guild.id, discordId, data);
  const roblox = getVerifiedRoblox(guild.id, discordId);
  const member = await guild.members.fetch(discordId).catch(() => null);

  const card = citizenIdCard({
    citizen,
    discordId,
    robloxUsername: roblox?.roblox_username,
    avatarUrl: member?.displayAvatarURL({ size: 128 }) || null,
  });
  await postToConfiguredChannel(guild, 'citizen_log_channel_id', card, 'citizen_panel_channel_id', env.citizenLogChannelId);
  return citizen;
}

function getCitizenSummary(guildId, discordId) {
  const citizen = citizensRepo.getActive(guildId, discordId);
  if (!citizen) return null;
  const fines = finesRepo.listByCitizen(citizen.id);
  const unpaidTotal = finesRepo.sumUnpaid(citizen.id);
  const records = recordsRepo.listByCitizen(citizen.id);
  return { citizen, fines, unpaidTotal, records };
}

module.exports = {
  getVerifiedRoblox,
  getActiveCitizen,
  createCitizen,
  getCitizenSummary,
};

// re-export tak, aby konsumenci nie musieli znac configService bezposrednio
module.exports.CONFIG_KEYS = CONFIG_KEYS;
