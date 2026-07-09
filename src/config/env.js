require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Brak wymaganej zmiennej srodowiskowej: ${name}`);
  }
  return value;
}

const env = {
  discordToken: required('DISCORD_TOKEN'),
  clientId: required('CLIENT_ID'),
  guildId: process.env.GUILD_ID || null,
  deployGlobal: process.env.DEPLOY_GLOBAL === 'true',
  databasePath: process.env.DATABASE_PATH || './data/erlc.sqlite',
  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = env;
