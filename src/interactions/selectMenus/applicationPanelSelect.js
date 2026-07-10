const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { startsWith, build } = require('../../utils/customId');
const factionService = require('../../services/factionService');
const { showApplicationModal } = require('../../services/applicationModals');
const { errorEmbed, brandEmbed } = require('../../utils/embeds');

module.exports = {
  match: (customId) => startsWith(customId, 'application', 'panel', 'select'),
  async execute(interaction) {
    const choice = interaction.values[0];

    if (choice === 'staff') {
      await showApplicationModal(interaction, 'staff');
      return;
    }

    if (choice === 'faction') {
      const factions = factionService.listFactions(interaction.guildId);
      if (!factions.length) {
        await interaction.reply({
          embeds: [errorEmbed('Żadna frakcja nie jest obecnie skonfigurowana na tym serwerze.')],
          ephemeral: true,
        });
        return;
      }

      const select = new StringSelectMenuBuilder()
        .setCustomId(build('application', 'faction', 'select'))
        .setPlaceholder('Wybierz frakcję...')
        .addOptions(
          factions.slice(0, 25).map((f) => ({
            label: f.name,
            value: String(f.id),
            description: f.short_name || undefined,
            emoji: '🛡️',
          }))
        );

      await interaction.reply({
        embeds: [brandEmbed({ description: 'Do której frakcji chcesz aplikować?' })],
        components: [new ActionRowBuilder().addComponents(select)],
        ephemeral: true,
      });
    }
  },
};
