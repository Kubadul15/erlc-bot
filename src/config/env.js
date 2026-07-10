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

  // Rola nadawana automatycznie po pomyslnej weryfikacji konta Roblox.
  verifiedRobloxRoleId: process.env.VERIFIED_ROBLOX_ROLE_ID || null,
  // Kanal, na ktory trafiaja utworzone dowody osobiste. Jesli puste, uzywany jest /config (citizen_log_channel_id).
  citizenLogChannelId: process.env.CITIZEN_LOG_CHANNEL_ID || null,
};

module.exports = env;
