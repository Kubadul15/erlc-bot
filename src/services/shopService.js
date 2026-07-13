const shopItemsRepo = require('../database/repositories/shopItems.repo');
const economyService = require('./economyService');
const { parseHexColor } = require('../utils/cardKit');
const logger = require('../utils/logger');

/**
 * Tworzy pozycje w sklepie. Jesli createRole=true (domyslnie), bot sam tworzy
 * nowa role na Discordzie i wiaze ja z tym przedmiotem - zakup nadaje te role.
 */
async function createItem(guild, { name, description, price, emoji, color, createRole = true }) {
  let roleId = null;
  if (createRole) {
    const role = await guild.roles.create({
      name,
      color: parseHexColor(color, undefined),
      reason: 'Utworzono przez /sklep-admin dodaj',
    });
    roleId = role.id;
  }

  const itemId = shopItemsRepo.create(guild.id, { name, description, price, roleId, emoji });
  return shopItemsRepo.getById(itemId);
}

function removeItem(itemId) {
  shopItemsRepo.deactivate(itemId);
}

function listItems(guildId) {
  return shopItemsRepo.listActive(guildId);
}

function getItem(itemId) {
  return shopItemsRepo.getById(itemId);
}

/** Kupuje przedmiot: sciaga srodki z portfela i (jesli dotyczy) nadaje powiazana role. */
async function purchaseItem(guild, discordId, itemId) {
  const item = shopItemsRepo.getById(itemId);
  if (!item || !item.active || item.guild_id !== guild.id) {
    return { ok: false, reason: 'not_found' };
  }

  try {
    economyService.spend(guild.id, discordId, item.price, 'purchase', { itemId: item.id, reason: item.name });
  } catch (err) {
    if (err.message === 'INSUFFICIENT_FUNDS') return { ok: false, reason: 'insufficient_funds', item };
    throw err;
  }

  if (item.role_id) {
    try {
      const member = await guild.members.fetch(discordId);
      await member.roles.add(item.role_id);
    } catch (err) {
      logger.warn(`Nie udało się nadać roli za zakup (${item.role_id}, ${discordId}):`, err.message);
    }
  }

  return { ok: true, item };
}

module.exports = { createItem, removeItem, listItems, getItem, purchaseItem };
