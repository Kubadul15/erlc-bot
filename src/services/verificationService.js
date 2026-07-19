const crypto = require('node:crypto');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { verificationCaptchaCard, verificationSuccessCard } = require('../utils/cards');
const { build } = require('../utils/customId');
const env = require('../config/env');
const logger = require('../utils/logger');

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bez znakow latwych do pomylenia (0/O, 1/I)

// Na tym konkretnym serwerze rola zweryfikowana ma byc zawsze ta - niezaleznie od tego,
// co ustawiono w VERIFIED_ROLE_ID (env). Nadpisuje env tylko dla tego jednego guildId.
const VERIFIED_ROLE_OVERRIDE = {
  guildId: '1524518836311822376',
  roleId: '1524518836366344338',
};

function generateCode() {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

/** Kod weryfikacyjny podrozowuje w customId przycisku/modala - caly przeplyw miesci sie w jednej interakcji, wiec nie trzeba go nigdzie zapisywac. */
function startVerification() {
  const code = generateCode();
  const continueRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(build('verify', 'continue', code))
      .setLabel('Wpisz kod i pseudonim')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅')
  );
  return verificationCaptchaCard({ code, actionRow: continueRow });
}

function retryButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(build('verify', 'start')).setLabel('Spróbuj ponownie').setStyle(ButtonStyle.Primary).setEmoji('🔄')
  );
}

function continueToIdButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(build('citizen', 'id', 'continue')).setLabel('Wyrób dowód').setStyle(ButtonStyle.Success).setEmoji('🪪')
  );
}

/** Nadaje role zweryfikowana: dla VERIFIED_ROLE_OVERRIDE.guildId zawsze uzywa jej roleId (ignorujac env), w przeciwnym razie VERIFIED_ROLE_ID z env. */
async function grantVerifiedRole(guild, discordId) {
  const roleId = guild.id === VERIFIED_ROLE_OVERRIDE.guildId ? VERIFIED_ROLE_OVERRIDE.roleId : env.verifiedRoleId;
  if (!roleId) return;
  try {
    const member = await guild.members.fetch(discordId);
    await member.roles.add(roleId);
  } catch (err) {
    logger.warn(`Nie udało się nadać roli po weryfikacji (${discordId}):`, err.message);
  }
}

/**
 * Sprawdza kod captcha i ustawia pseudonim jako nick na serwerze.
 * reason: 'code_mismatch' | 'nickname_failed'
 */
async function completeVerification(guild, discordId, expectedCode, enteredCode, nickname) {
  if (enteredCode.trim().toUpperCase() !== expectedCode.toUpperCase()) {
    return { ok: false, reason: 'code_mismatch' };
  }

  const trimmedNickname = nickname.trim();
  const member = await guild.members.fetch(discordId).catch(() => null);
  let nicknameSet = false;
  if (member) {
    try {
      await member.setNickname(trimmedNickname);
      nicknameSet = true;
    } catch (err) {
      logger.warn(`Nie udało się ustawić nicku po weryfikacji (${discordId}):`, err.message);
    }
  }

  await grantVerifiedRole(guild, discordId);

  return {
    ok: true,
    nicknameSet,
    card: verificationSuccessCard({ nickname: trimmedNickname, actionRow: continueToIdButtonRow() }),
  };
}

module.exports = { startVerification, completeVerification, retryButtonRow };
