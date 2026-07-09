const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO factions (guild_id, name, short_name, color, role_id, management_role_id, review_channel_id, created_at)
  VALUES (@guildId, @name, @shortName, @color, @roleId, @managementRoleId, @reviewChannelId, @now)
`);
const getByIdStmt = db.prepare('SELECT * FROM factions WHERE id = ?');
const listByGuildStmt = db.prepare('SELECT * FROM factions WHERE guild_id = ? ORDER BY name');
const deleteStmt = db.prepare('DELETE FROM factions WHERE id = ?');
const updateStmt = db.prepare(`
  UPDATE factions SET
    name = COALESCE(@name, name),
    short_name = COALESCE(@shortName, short_name),
    color = COALESCE(@color, color),
    role_id = COALESCE(@roleId, role_id),
    management_role_id = COALESCE(@managementRoleId, management_role_id),
    review_channel_id = COALESCE(@reviewChannelId, review_channel_id)
  WHERE id = @id
`);

function create(guildId, data) {
  const info = insertStmt.run({
    guildId,
    name: data.name,
    shortName: data.shortName || null,
    color: data.color || null,
    roleId: data.roleId || null,
    managementRoleId: data.managementRoleId || null,
    reviewChannelId: data.reviewChannelId || null,
    now: Date.now(),
  });
  return info.lastInsertRowid;
}

function getById(id) {
  return getByIdStmt.get(id) || null;
}

function listByGuild(guildId) {
  return listByGuildStmt.all(guildId);
}

function remove(id) {
  deleteStmt.run(id);
}

function update(id, data) {
  updateStmt.run({
    id,
    name: data.name ?? null,
    shortName: data.shortName ?? null,
    color: data.color ?? null,
    roleId: data.roleId ?? null,
    managementRoleId: data.managementRoleId ?? null,
    reviewChannelId: data.reviewChannelId ?? null,
  });
}

module.exports = { create, getById, listByGuild, remove, update };
