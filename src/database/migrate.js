const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const applied = new Set(
    db.prepare('SELECT name FROM _migrations').all().map((row) => row.name)
  );

  const insertApplied = db.prepare(
    'INSERT INTO _migrations (name, applied_at) VALUES (?, ?)'
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const runMigration = db.transaction(() => {
      db.exec(sql);
      insertApplied.run(file, Date.now());
    });
    runMigration();
    console.log(`[migrate] zastosowano: ${file}`);
  }

  console.log('[migrate] baza danych aktualna.');
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
