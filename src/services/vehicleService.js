const vehiclesRepo = require('../database/repositories/vehicles.repo');
const { vehicleCard } = require('../utils/cards');
const { postToConfiguredChannel } = require('./configService');

async function registerVehicle(guild, discordId, citizenId, data) {
  const vehicleId = vehiclesRepo.register(guild.id, discordId, citizenId, data);
  const [vehicle] = vehiclesRepo.listByOwner(guild.id, discordId).filter((v) => v.id === vehicleId);
  const card = vehicleCard({ vehicle, discordId });
  await postToConfiguredChannel(guild, 'vehicle_log_channel_id', card, 'citizen_panel_channel_id');
  return vehicle;
}

function listVehicles(guildId, discordId) {
  return vehiclesRepo.listByOwner(guildId, discordId);
}

module.exports = { registerVehicle, listVehicles };
