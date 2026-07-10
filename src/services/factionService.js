const factionsRepo = require('../database/repositories/factions.repo');
const ranksRepo = require('../database/repositories/factionRanks.repo');
const membersRepo = require('../database/repositories/factionMembers.repo');
const logger = require('../utils/logger');

async function syncMemberRoles(guild, discordId, { addRoleIds = [], removeRoleIds = [] } = {}) {
  const member = await guild.members.fetch(discordId).catch(() => null);
  if (!member) return;
  const toAdd = addRoleIds.filter(Boolean);
  const toRemove = removeRoleIds.filter(Boolean);
  try {
    if (toAdd.length) await member.roles.add(toAdd);
    if (toRemove.length) await member.roles.remove(toRemove);
  } catch (err) {
    logger.warn(`Nie udało się zsynchronizować ról frakcji dla ${discordId}:`, err.message);
  }
}

function createFaction(guildId, data) {
  const factionId = factionsRepo.create(guildId, data);
  const defaultRankId = ranksRepo.create(factionId, 'Rekrut', 0, null);
  return { factionId, defaultRankId };
}

function getFactionByName(guildId, name) {
  return factionsRepo.getByName(guildId, name);
}

/** Tworzy frakcje tylko jesli nie istnieje juz frakcja o tej nazwie (case-insensitive). Zwraca {created: bool, faction}. */
function getOrCreateFaction(guildId, data) {
  const existing = factionsRepo.getByName(guildId, data.name);
  if (existing) return { created: false, faction: existing };
  const { factionId } = createFaction(guildId, data);
  return { created: true, faction: factionsRepo.getById(factionId) };
}

function deleteFaction(factionId) {
  factionsRepo.remove(factionId);
}

async function addMember(guild, factionId, discordId, rankId) {
  membersRepo.add(factionId, discordId, rankId);
  const faction = factionsRepo.getById(factionId);
  const rank = ranksRepo.getById(rankId);
  await syncMemberRoles(guild, discordId, {
    addRoleIds: [faction?.role_id, rank?.role_id],
  });
}

async function removeMember(guild, factionId, discordId) {
  const current = membersRepo.get(factionId, discordId);
  membersRepo.remove(factionId, discordId);
  if (!current) return;
  const faction = factionsRepo.getById(factionId);
  const rank = ranksRepo.getById(current.rank_id);
  await syncMemberRoles(guild, discordId, {
    removeRoleIds: [faction?.role_id, rank?.role_id],
  });
}

async function changeRank(guild, factionId, discordId, direction) {
  const current = membersRepo.get(factionId, discordId);
  if (!current) return { ok: false, reason: 'not_member' };

  const currentRank = ranksRepo.getById(current.rank_id);
  const nextRank =
    direction === 'up'
      ? ranksRepo.getNextHigher(factionId, currentRank.level)
      : ranksRepo.getNextLower(factionId, currentRank.level);

  if (!nextRank) return { ok: false, reason: 'no_further_rank' };

  membersRepo.setRank(factionId, discordId, nextRank.id);
  const faction = factionsRepo.getById(factionId);
  await syncMemberRoles(guild, discordId, {
    addRoleIds: [nextRank.role_id],
    removeRoleIds: [currentRank.role_id],
  });

  return { ok: true, previousRank: currentRank, newRank: nextRank, faction };
}

function listMembers(factionId) {
  return membersRepo.listByFaction(factionId);
}

function listRanks(factionId) {
  return ranksRepo.listByFaction(factionId);
}

function getFaction(factionId) {
  return factionsRepo.getById(factionId);
}

function listFactions(guildId) {
  return factionsRepo.listByGuild(guildId);
}

module.exports = {
  createFaction,
  getOrCreateFaction,
  getFactionByName,
  deleteFaction,
  addMember,
  removeMember,
  changeRank,
  listMembers,
  listRanks,
  getFaction,
  listFactions,
  addRank: (factionId, name, level, roleId) => ranksRepo.create(factionId, name, level, roleId),
  removeRank: (rankId) => ranksRepo.remove(rankId),
  getLowestRank: (factionId) => ranksRepo.getLowest(factionId),
};
