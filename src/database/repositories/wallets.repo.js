const db = require('../db');

const insertIfMissingStmt = db.prepare(`
  INSERT OR IGNORE INTO wallets (guild_id, discord_id, balance, updated_at)
  VALUES (@guildId, @discordId, 0, @now)
`);
const getStmt = db.prepare('SELECT * FROM wallets WHERE guild_id = ? AND discord_id = ?');
const adjustBalanceStmt = db.prepare(`
  UPDATE wallets SET balance = balance + @delta, updated_at = @now
  WHERE guild_id = @guildId AND discord_id = @discordId
`);
const setLastDailyStmt = db.prepare(`
  UPDATE wallets SET last_daily_at = @now, updated_at = @now WHERE guild_id = @guildId AND discord_id = @discordId
`);
const setLastWorkStmt = db.prepare(`
  UPDATE wallets SET last_work_at = @now, updated_at = @now WHERE guild_id = @guildId AND discord_id = @discordId
`);
const topBalancesStmt = db.prepare(`
  SELECT * FROM wallets WHERE guild_id = ? AND balance > 0 ORDER BY balance DESC LIMIT ?
`);

function getOrCreate(guildId, discordId) {
  insertIfMissingStmt.run({ guildId, discordId, now: Date.now() });
  return getStmt.get(guildId, discordId);
}

/** delta moze byc ujemne. Zwraca zaktualizowany portfel. Nie pozwala na balans ponizej zera. */
function adjustBalance(guildId, discordId, delta) {
  getOrCreate(guildId, discordId);
  const tx = db.transaction(() => {
    const current = getStmt.get(guildId, discordId);
    if (current.balance + delta < 0) {
      throw new Error('INSUFFICIENT_FUNDS');
    }
    adjustBalanceStmt.run({ guildId, discordId, delta, now: Date.now() });
  });
  tx();
  return getStmt.get(guildId, discordId);
}

function markDaily(guildId, discordId) {
  setLastDailyStmt.run({ guildId, discordId, now: Date.now() });
}

function markWork(guildId, discordId) {
  setLastWorkStmt.run({ guildId, discordId, now: Date.now() });
}

function topBalances(guildId, limit = 10) {
  return topBalancesStmt.all(guildId, limit);
}

module.exports = { getOrCreate, adjustBalance, markDaily, markWork, topBalances };
