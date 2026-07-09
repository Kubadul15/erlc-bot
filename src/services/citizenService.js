const citizensRepo = require('../database/repositories/citizens.repo');
const robloxRepo = require('../database/repositories/robloxAccounts.repo');
const finesRepo = require('../database/repositories/fines.repo');
const recordsRepo = require('../database/repositories/criminalRecords.repo');
const { citizenIdEmbed } = require('../utils/embeds');
const { postToConfiguredChannel, CONFIG_KEYS } = require('./configService');

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
  const embed = citizenIdEmbed(citizen, discordId, roblox?.roblox_username);
  await postToConfiguredChannel(guild, 'citizen_log_channel_id', { embeds: [embed] }, 'citizen_panel_channel_id');
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
