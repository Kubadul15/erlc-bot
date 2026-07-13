const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO shop_items (guild_id, name, description, price, role_id, emoji, active, created_at)
  VALUES (@guildId, @name, @description, @price, @roleId, @emoji, 1, @now)
`);
const getByIdStmt = db.prepare('SELECT * FROM shop_items WHERE id = ?');
const listActiveStmt = db.prepare('SELECT * FROM shop_items WHERE guild_id = ? AND active = 1 ORDER BY price ASC');
const deactivateStmt = db.prepare('UPDATE shop_items SET active = 0 WHERE id = ?');

function create(guildId, data) {
  const info = insertStmt.run({
    guildId,
    name: data.name,
    description: data.description || null,
    price: data.price,
    roleId: data.roleId || null,
    emoji: data.emoji || null,
    now: Date.now(),
  });
  return info.lastInsertRowid;
}

function getById(id) {
  return getByIdStmt.get(id) || null;
}

function listActive(guildId) {
  return listActiveStmt.all(guildId);
}

function deactivate(id) {
  deactivateStmt.run(id);
}

module.exports = { create, getById, listActive, deactivate };
