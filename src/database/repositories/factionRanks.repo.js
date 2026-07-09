const db = require('../db');

const insertStmt = db.prepare(`
  INSERT INTO faction_ranks (faction_id, name, level, role_id)
  VALUES (@factionId, @name, @level, @roleId)
`);
const listByFactionStmt = db.prepare(
  'SELECT * FROM faction_ranks WHERE faction_id = ? ORDER BY level ASC'
);
const getByIdStmt = db.prepare('SELECT * FROM faction_ranks WHERE id = ?');
const deleteStmt = db.prepare('DELETE FROM faction_ranks WHERE id = ?');
const getLowestStmt = db.prepare(
  'SELECT * FROM faction_ranks WHERE faction_id = ? ORDER BY level ASC LIMIT 1'
);
const getNextHigherStmt = db.prepare(
  'SELECT * FROM faction_ranks WHERE faction_id = ? AND level > ? ORDER BY level ASC LIMIT 1'
);
const getNextLowerStmt = db.prepare(
  'SELECT * FROM faction_ranks WHERE faction_id = ? AND level < ? ORDER BY level DESC LIMIT 1'
);

function create(factionId, name, level, roleId = null) {
  const info = insertStmt.run({ factionId, name, level, roleId });
  return info.lastInsertRowid;
}

function listByFaction(factionId) {
  return listByFactionStmt.all(factionId);
}

function getById(id) {
  return getByIdStmt.get(id) || null;
}

function remove(id) {
  deleteStmt.run(id);
}

function getLowest(factionId) {
  return getLowestStmt.get(factionId) || null;
}

function getNextHigher(factionId, currentLevel) {
  return getNextHigherStmt.get(factionId, currentLevel) || null;
}

function getNextLower(factionId, currentLevel) {
  return getNextLowerStmt.get(factionId, currentLevel) || null;
}

module.exports = { create, listByFaction, getById, remove, getLowest, getNextHigher, getNextLower };
