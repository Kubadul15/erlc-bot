const { REST, Routes } = require('discord.js');
const env = require('./config/env');
const logger = require('./utils/logger');

/**
 * Rejestruje slash commands z client.commands (Collection nazwa -> { data, execute }).
 * Idempotentne - PUT nadpisuje caly zestaw komend, wiec bezpieczne jest wywolywanie
 * tego przy kazdym starcie bota, nie tylko recznie przez `npm run deploy`.
 */
async function registerCommands(client) {
  const commands = [...client.commands.values()].map((c) => c.data.toJSON());
  const rest = new REST().setToken(env.discordToken);

  if (env.deployGlobal) {
    await rest.put(Routes.applicationCommands(env.clientId), { body: commands });
    logger.info(`Zarejestrowano ${commands.length} komend globalnie.`);
  } else {
    if (!env.guildId) {
      throw new Error('GUILD_ID jest wymagane przy rejestracji komend na serwerze deweloperskim (DEPLOY_GLOBAL=false).');
    }
    await rest.put(Routes.applicationGuildCommands(env.clientId, env.guildId), { body: commands });
    logger.info(`Zarejestrowano ${commands.length} komend na serwerze ${env.guildId}.`);
  }
}

module.exports = { registerCommands };

// Uzycie jako samodzielny skrypt CLI: `npm run deploy` (przydatne do recznej/globalnej
// rejestracji bez uruchamiania calego bota). Zbudowany "client" to tylko obiekt z
// Collection komend - nie loguje sie do Discorda przez gateway.
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');
  const { Collection } = require('discord.js');

  function walkJsFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(walkJsFiles(fullPath));
      } else if (entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const commands = new Collection();
  for (const file of walkJsFiles(path.join(__dirname, 'commands'))) {
    const command = require(file);
    if (!command?.data?.name) continue;
    commands.set(command.data.name, command);
  }

  registerCommands({ commands }).catch((err) => {
    logger.error('Nie udało się zarejestrować komend:', err);
    process.exit(1);
  });
}
