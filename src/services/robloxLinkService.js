const crypto = require('node:crypto');
const robloxAccountsRepo = require('../database/repositories/robloxAccounts.repo');
const robloxApi = require('./robloxApi');
const { robloxLinkCardEmbed } = require('../utils/embeds');

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bez znakow latwych do pomylenia (0/O, 1/I)

function generateCode() {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return `VORTEX-${code}`;
}

/**
 * Rozpoczyna (lub restartuje) proces powiazania konta Roblox: sprawdza czy nazwa
 * uzytkownika istnieje, generuje kod weryfikacyjny i zapisuje konto jako niezweryfikowane.
 * Zwraca gotowy embed z instrukcjami do wyslania uzytkownikowi.
 */
async function startLinking(guildId, discordId, usernameInput) {
  const resolved = await robloxApi.resolveUsername(usernameInput.trim());
  if (!resolved) {
    return { ok: false, reason: 'not_found' };
  }

  const code = generateCode();
  robloxAccountsRepo.startLink(guildId, discordId, resolved.id, resolved.name, code);

  const avatarUrl = await robloxApi.getAvatarThumbnailUrl(resolved.id);

  return {
    ok: true,
    embed: robloxLinkCardEmbed({ resolved, avatarUrl, code, verified: false }),
  };
}

/**
 * Sprawdza, czy uzytkownik dodal kod weryfikacyjny do opisu profilu Roblox.
 * reason: 'no_pending' (nikt nie rozpoczal linkowania) | 'api_error' | 'code_missing'
 */
async function verifyLinking(guildId, discordId) {
  const pending = robloxAccountsRepo.get(guildId, discordId);
  if (!pending || pending.verified || !pending.verification_code) {
    return { ok: false, reason: 'no_pending' };
  }

  const details = await robloxApi.getUserDetails(pending.roblox_user_id);
  if (!details) {
    return { ok: false, reason: 'api_error' };
  }

  const description = details.description || '';
  if (!description.includes(pending.verification_code)) {
    return { ok: false, reason: 'code_missing' };
  }

  robloxAccountsRepo.markVerified(guildId, discordId);

  const avatarUrl = await robloxApi.getAvatarThumbnailUrl(pending.roblox_user_id);
  return {
    ok: true,
    embed: robloxLinkCardEmbed({
      resolved: { name: pending.roblox_username, displayName: details.displayName },
      avatarUrl,
      verified: true,
    }),
  };
}

function getLinkedAccount(guildId, discordId) {
  return robloxAccountsRepo.get(guildId, discordId);
}

function isVerified(guildId, discordId) {
  const row = robloxAccountsRepo.get(guildId, discordId);
  return Boolean(row?.verified);
}

module.exports = { startLinking, verifyLinking, getLinkedAccount, isVerified };
