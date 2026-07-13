const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO vehicles
    (guild_id, discord_id, citizen_id, make_model, plate, color, year, info, photo_url, created_at)
  VALUES
    (@guildId, @discordId, @citizenId, @makeModel, @plate, @color, @year, @info, @photoUrl, @now)
`);
const listByOwnerStmt = db.prepare(
  'SELECT * FROM vehicles WHERE guild_id = ? AND discord_id = ? ORDER BY created_at DESC'
);

function register(guildId, discordId, citizenId, data) {
  const info = insertStmt.run({
    guildId,
    discordId,
    citizenId,
    makeModel: data.makeModel,
    plate: data.plate,
    color: data.color || null,
    year: data.year || null,
    info: data.info || null,
    photoUrl: data.photoUrl || null,
    now: Date.now(),
  });
  return info.lastInsertRowid;
}

function listByOwner(guildId, discordId) {
  return listByOwnerStmt.all(guildId, discordId);
}

module.exports = { register, listByOwner };
