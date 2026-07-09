const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const env = require('./config/env');
const logger = require('./utils/logger');
const migrate = require('./database/migrate');

migrate();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

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

// --- Komendy slash ---
client.commands = new Collection();
for (const file of walkJsFiles(path.join(__dirname, 'commands'))) {
  const command = require(file);
  if (!command?.data?.name || typeof command.execute !== 'function') {
    logger.warn(`Pominięto plik komendy bez data/execute: ${file}`);
    continue;
  }
  client.commands.set(command.data.name, command);
}
logger.info(`Załadowano ${client.commands.size} komend slash.`);

// --- Interakcje: przyciski, select menu, modale ---
function loadInteractionHandlers(subdir) {
  const handlers = [];
  for (const file of walkJsFiles(path.join(__dirname, 'interactions', subdir))) {
    const mod = require(file);
    const list = Array.isArray(mod) ? mod : [mod];
    for (const handler of list) {
      if (typeof handler?.match !== 'function' || typeof handler?.execute !== 'function') {
        logger.warn(`Pominięto handler bez match/execute: ${file}`);
        continue;
      }
      handlers.push(handler);
    }
  }
  return handlers;
}

client.buttonHandlers = loadInteractionHandlers('buttons');
client.selectMenuHandlers = loadInteractionHandlers('selectMenus');
client.modalHandlers = loadInteractionHandlers('modals');
logger.info(
  `Załadowano ${client.buttonHandlers.length} przycisków, ${client.selectMenuHandlers.length} select menu, ${client.modalHandlers.length} modali.`
);

// --- Eventy ---
for (const file of walkJsFiles(path.join(__dirname, 'events'))) {
  const event = require(file);
  if (!event?.name || typeof event.execute !== 'function') {
    logger.warn(`Pominięto plik eventu bez name/execute: ${file}`);
    continue;
  }
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(env.discordToken).catch((err) => {
  logger.error('Nie udało się zalogować bota:', err);
  process.exit(1);
});
