const walletsRepo = require('../database/repositories/wallets.repo');
const transactionsRepo = require('../database/repositories/transactions.repo');
const finesRepo = require('../database/repositories/fines.repo');
const citizensRepo = require('../database/repositories/citizens.repo');
const {
  DAILY_REWARD_MIN,
  DAILY_REWARD_MAX,
  DAILY_COOLDOWN_MS,
  WORK_REWARD_MIN,
  WORK_REWARD_MAX,
  WORK_COOLDOWN_MS,
  WORK_FLAVOR_TEXTS,
  FINE_PAYMENT_TRANSACTION_TYPE,
} = require('../config/constants');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getWallet(guildId, discordId) {
  return walletsRepo.getOrCreate(guildId, discordId);
}

function grant(guildId, discordId, amount, type, opts = {}) {
  const wallet = walletsRepo.adjustBalance(guildId, discordId, amount);
  transactionsRepo.record(guildId, discordId, type, amount, opts);
  return wallet;
}

/** Rzuca 'INSUFFICIENT_FUNDS' (przez wallets.repo), jesli brak srodkow. */
function spend(guildId, discordId, amount, type, opts = {}) {
  const wallet = walletsRepo.adjustBalance(guildId, discordId, -amount);
  transactionsRepo.record(guildId, discordId, type, -amount, opts);
  return wallet;
}

function claimDaily(guildId, discordId) {
  const wallet = walletsRepo.getOrCreate(guildId, discordId);
  if (wallet.last_daily_at && Date.now() - wallet.last_daily_at < DAILY_COOLDOWN_MS) {
    return { ok: false, reason: 'cooldown', nextAvailableAt: wallet.last_daily_at + DAILY_COOLDOWN_MS };
  }

  const amount = randomInt(DAILY_REWARD_MIN, DAILY_REWARD_MAX);
  const updated = grant(guildId, discordId, amount, 'daily', { reason: 'Dzienna nagroda' });
  walletsRepo.markDaily(guildId, discordId);
  return { ok: true, amount, wallet: updated };
}

function work(guildId, discordId) {
  const wallet = walletsRepo.getOrCreate(guildId, discordId);
  if (wallet.last_work_at && Date.now() - wallet.last_work_at < WORK_COOLDOWN_MS) {
    return { ok: false, reason: 'cooldown', nextAvailableAt: wallet.last_work_at + WORK_COOLDOWN_MS };
  }

  const amount = randomInt(WORK_REWARD_MIN, WORK_REWARD_MAX);
  const flavorText = WORK_FLAVOR_TEXTS[randomInt(0, WORK_FLAVOR_TEXTS.length - 1)];
  const updated = grant(guildId, discordId, amount, 'work', { reason: flavorText });
  walletsRepo.markWork(guildId, discordId);
  return { ok: true, amount, flavorText, wallet: updated };
}

function pay(guildId, fromId, toId, amount) {
  if (fromId === toId) return { ok: false, reason: 'self' };
  if (amount <= 0) return { ok: false, reason: 'invalid_amount' };

  let senderWallet;
  try {
    senderWallet = spend(guildId, fromId, amount, 'pay_sent', { relatedDiscordId: toId });
  } catch (err) {
    if (err.message === 'INSUFFICIENT_FUNDS') return { ok: false, reason: 'insufficient_funds' };
    throw err;
  }
  const receiverWallet = grant(guildId, toId, amount, 'pay_received', { relatedDiscordId: fromId });
  return { ok: true, senderWallet, receiverWallet };
}

function adminGrant(guildId, targetId, amount, staffId, reason) {
  return grant(guildId, targetId, amount, 'admin_grant', { reason, relatedDiscordId: staffId });
}

function adminRemove(guildId, targetId, amount, staffId, reason) {
  try {
    return { ok: true, wallet: spend(guildId, targetId, amount, 'admin_remove', { reason, relatedDiscordId: staffId }) };
  } catch (err) {
    if (err.message === 'INSUFFICIENT_FUNDS') return { ok: false, reason: 'insufficient_funds' };
    throw err;
  }
}

function leaderboard(guildId, limit = 10) {
  return walletsRepo.topBalances(guildId, limit);
}

/** Oplaca konkretny mandat z portfela wlasciciela dowodu. */
function payFine(guildId, discordId, fineId) {
  const fine = finesRepo.getById(fineId);
  if (!fine || fine.guild_id !== guildId) return { ok: false, reason: 'not_found' };
  if (fine.status !== 'unpaid') return { ok: false, reason: 'already_paid' };

  const citizen = citizensRepo.getById(fine.citizen_id);
  if (!citizen || citizen.discord_id !== discordId) return { ok: false, reason: 'not_owner' };

  try {
    spend(guildId, discordId, fine.amount, FINE_PAYMENT_TRANSACTION_TYPE, { reason: `Mandat #${fine.id}` });
  } catch (err) {
    if (err.message === 'INSUFFICIENT_FUNDS') return { ok: false, reason: 'insufficient_funds' };
    throw err;
  }

  finesRepo.markPaid(fine.id);
  return { ok: true, fine };
}

module.exports = { getWallet, grant, spend, claimDaily, work, pay, adminGrant, adminRemove, leaderboard, payFine };
