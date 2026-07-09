const logger = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.info(`Zalogowano jako ${client.user.tag}. Serwery: ${client.guilds.cache.size}.`);
  },
};
