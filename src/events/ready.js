const logger = require('../utils/logger');
const { registerCommands } = require('../deploy-commands');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.info(`Zalogowano jako ${client.user.tag}. Serwery: ${client.guilds.cache.size}.`);
    try {
      await registerCommands(client);
    } catch (err) {
      logger.error('Nie udało się automatycznie zarejestrować komend slash:', err);
    }
  },
};
