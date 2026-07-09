const citizensRepo = require('../database/repositories/citizens.repo');
const robloxRepo = require('../database/repositories/robloxAccounts.repo');
const finesRepo = require('../database/repositories/fines.repo');
const recordsRepo = require('../database/repositories/criminalRecords.repo');
const { citizenIdEmbed } = require('../utils/embeds');
const { postToConfiguredChannel, CONFIG_KEYS } = require('./configService');

function getLinkedRoblox(guildId, discordId) {
  return robloxRepo.get(guildId, discordId);
}

function linkRoblox(guildId, discordId, username) {
  robloxRepo.link(guildId, discordId, username);
}

function getActiveCitizen(guildId, discordId) {
  return citizensRepo.getActive(guildId, discordId);
}

async function createCitizen(guild, discordId, data) {
  const citizen = citizensRepo.createOrReplace(guild.id, discordId, data);
  const roblox = getLinkedRoblox(guild.id, discordId);
  const embed = citizenIdEmbed(citizen, discordId, roblox?.roblox_username);
  await postToConfiguredChannel(guild, 'citizen_log_channel_id', { embeds: [embed] });
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
  getLinkedRoblox,
  linkRoblox,
  getActiveCitizen,
  createCitizen,
  getCitizenSummary,
};

// re-export tak, aby konsumenci nie musieli znac configService bezposrednio
module.exports.CONFIG_KEYS = CONFIG_KEYS;
