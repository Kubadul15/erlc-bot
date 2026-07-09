const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const env = require('./config/env');
const logger = require('./utils/logger');

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

async function deploy() {
  const commands = [];
  for (const file of walkJsFiles(path.join(__dirname, 'commands'))) {
    const command = require(file);
    if (!command?.data) continue;
    commands.push(command.data.toJSON());
  }

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

deploy().catch((err) => {
  logger.error('Nie udało się zarejestrować komend:', err);
  process.exit(1);
});
