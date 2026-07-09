const logger = require('../utils/logger');
const { errorEmbed } = require('../utils/embeds');

async function replyError(interaction, message) {
  const payload = { embeds: [errorEmbed(message)], ephemeral: true };
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  } catch (err) {
    logger.error('Nie udało się wysłać komunikatu o błędzie:', err);
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
        return;
      }

      if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command?.autocomplete) return;
        await command.autocomplete(interaction, client);
        return;
      }

      if (interaction.isButton()) {
        const handler = client.buttonHandlers.find((h) => h.match(interaction.customId));
        if (!handler) return;
        await handler.execute(interaction, interaction.customId.split(':'), client);
        return;
      }

      if (interaction.isAnySelectMenu()) {
        const handler = client.selectMenuHandlers.find((h) => h.match(interaction.customId));
        if (!handler) return;
        await handler.execute(interaction, interaction.customId.split(':'), client);
        return;
      }

      if (interaction.isModalSubmit()) {
        const handler = client.modalHandlers.find((h) => h.match(interaction.customId));
        if (!handler) return;
        await handler.execute(interaction, interaction.customId.split(':'), client);
        return;
      }
    } catch (err) {
      logger.error(`Błąd podczas obsługi interakcji (${interaction.type}):`, err);
      await replyError(interaction, 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.');
    }
  },
};
