const logger = require('../utils/logger');
const { registerCommands } = require('../deploy-commands');
const statsService = require('../services/statsService');
const { STAT_UPDATE_INTERVAL_MS } = require('../config/constants');

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

    const runStatsUpdate = () => statsService.updateAllStatChannels(client).catch((err) => logger.error('Błąd aktualizacji kanałów statystyk:', err));
    runStatsUpdate();
    setInterval(runStatsUpdate, STAT_UPDATE_INTERVAL_MS);
  },
};
