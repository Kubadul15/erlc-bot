const guildSettings = require('../database/repositories/guildSettings.repo');
const logger = require('../utils/logger');

const CONFIG_KEYS = {
  channels: {
    citizen_panel_channel_id: 'Kanał panelu obywatela',
    citizen_log_channel_id: 'Kanał logów dowodów (nadpisywany przez env CITIZEN_LOG_CHANNEL_ID)',
    verify_panel_channel_id: 'Kanał panelu weryfikacji',
    vehicle_log_channel_id: 'Kanał logów pojazdów',
    ticket_panel_channel_id: 'Kanał panelu ticketów',
    ticket_parent_category_id: 'Kategoria kanałów ticketów',
    ticket_transcript_channel_id: 'Kanał transkryptów ticketów',
    mod_log_channel_id: 'Kanał logów moderacji',
    faction_panel_channel_id: 'Kanał Panelu Frakcji',
    rp_announce_channel_id: 'Kanał ogłoszeń RP (/rp)',
    shop_panel_channel_id: 'Kanał panelu sklepu',
  },
  roles: {
    role_admin: 'Rola administratora bota',
    role_staff: 'Rola staffu',
    role_rp_ping: 'Rola pingowana przy starcie RP',
    ticket_role_general: 'Rola wsparcia — Pomoc ogólna',
    ticket_role_report: 'Rola wsparcia — Zgłoszenie gracza',
    ticket_role_appeal: 'Rola wsparcia — Odwołania',
    ticket_role_bug: 'Rola wsparcia — Bugi',
    ticket_role_management: 'Rola wsparcia — Zarząd',
    ticket_role_shop: 'Rola wsparcia — Sklep',
  },
};

function getChannelId(guildId, key) {
  return guildSettings.get(guildId, key);
}

function getRoleId(guildId, key) {
  return guildSettings.get(guildId, key);
}

/**
 * envChannelId (opcjonalny) ma pierwszenstwo nad kluczem z /config - pozwala na "sztywne"
 * skonfigurowanie kanalu przez zmienna srodowiskowa (np. CITIZEN_LOG_CHANNEL_ID), zamiast
 * wymagac uruchomienia komendy po kazdym redeployu.
 */
async function getConfiguredChannel(guild, key, fallbackKey, envChannelId) {
  let channelId = envChannelId || getChannelId(guild.id, key);
  if (!channelId && fallbackKey) {
    channelId = getChannelId(guild.id, fallbackKey);
  }
  if (!channelId) return null;
  try {
    return await guild.channels.fetch(channelId);
  } catch (err) {
    logger.warn(`Nie udało się pobrać skonfigurowanego kanału (${key}=${channelId}):`, err.message);
    return null;
  }
}

/** fallbackKey pozwala nie "gubic" wiadomosci, gdy dedykowany kanal logow nie zostal jeszcze skonfigurowany. */
async function postToConfiguredChannel(guild, key, payload, fallbackKey, envChannelId) {
  const channel = await getConfiguredChannel(guild, key, fallbackKey, envChannelId);
  if (!channel) return null;
  return channel.send(payload);
}

module.exports = {
  CONFIG_KEYS,
  getChannelId,
  getRoleId,
  getConfiguredChannel,
  postToConfiguredChannel,
};
