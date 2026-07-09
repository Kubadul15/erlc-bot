const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO citizens
    (guild_id, discord_id, full_name, age, origin, residence, backstory, status, created_at, updated_at)
  VALUES
    (@guildId, @discordId, @fullName, @age, @origin, @residence, @backstory, 'active', @now, @now)
`);
const revokeActiveStmt = db.prepare(`
  UPDATE citizens SET status = 'revoked', updated_at = @now
  WHERE guild_id = @guildId AND discord_id = @discordId AND status = 'active'
`);
const getActiveStmt = db.prepare(
  "SELECT * FROM citizens WHERE guild_id = ? AND discord_id = ? AND status = 'active'"
);
const getByIdStmt = db.prepare('SELECT * FROM citizens WHERE id = ?');

function createOrReplace(guildId, discordId, data) {
  const now = Date.now();
  const createTx = db.transaction(() => {
    revokeActiveStmt.run({ guildId, discordId, now });
    insertStmt.run({
      guildId,
      discordId,
      fullName: data.fullName,
      age: data.age,
      origin: data.origin,
      residence: data.residence,
      backstory: data.backstory,
      now,
    });
  });
  createTx();
  return getActiveStmt.get(guildId, discordId);
}

function getActive(guildId, discordId) {
  return getActiveStmt.get(guildId, discordId) || null;
}

function getById(citizenId) {
  return getByIdStmt.get(citizenId) || null;
}

module.exports = { createOrReplace, getActive, getById };
