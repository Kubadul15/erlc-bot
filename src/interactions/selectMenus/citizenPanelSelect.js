const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { startsWith, build } = require('../../utils/customId');
const citizenService = require('../../services/citizenService');
const vehicleService = require('../../services/vehicleService');
const { citizenIdEmbed, vehicleEmbed, errorEmbed, brandEmbed } = require('../../utils/embeds');
const { EMOJI } = require('../../config/constants');
const { showIdModal, showVehicleModal } = require('../../services/citizenModals');

module.exports = {
  match: (customId) => startsWith(customId, 'citizen', 'panel', 'select'),
  async execute(interaction) {
    const choice = interaction.values[0];

    if (choice === 'id') {
      const roblox = citizenService.getLinkedRoblox(interaction.guildId, interaction.user.id);
      if (!roblox) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(build('citizen', 'link', 'continue'))
            .setLabel('Powiąż konto Roblox')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔗')
        );
        await interaction.reply({
          embeds: [
            brandEmbed({
              description:
                `${EMOJI.info} Zanim wyrobisz dowód, musisz powiązać swoją nazwę użytkownika Roblox.\n` +
                `Kliknij przycisk poniżej albo użyj komendy \`/link-roblox\`.`,
            }),
          ],
          components: [row],
          ephemeral: true,
        });
        return;
      }
      await showIdModal(interaction);
      return;
    }

    if (choice === 'vehicle') {
      const citizen = citizenService.getActiveCitizen(interaction.guildId, interaction.user.id);
      if (!citizen) {
        await interaction.reply({
          embeds: [errorEmbed('Musisz najpierw wyrobić dowód osobisty.')],
          ephemeral: true,
        });
        return;
      }
      await showVehicleModal(interaction, citizen.id);
      return;
    }

    if (choice === 'check_id') {
      const summary = citizenService.getCitizenSummary(interaction.guildId, interaction.user.id);
      if (!summary) {
        await interaction.reply({ embeds: [errorEmbed('Nie posiadasz dowodu osobistego.')], ephemeral: true });
        return;
      }
      const roblox = citizenService.getLinkedRoblox(interaction.guildId, interaction.user.id);
      const idEmbed = citizenIdEmbed(summary.citizen, interaction.user.id, roblox?.roblox_username);
      idEmbed.addFields(
        { name: '💰 Nieopłacone mandaty', value: `$${summary.unpaidTotal} (${summary.fines.length} łącznie)`, inline: true },
        { name: '⚖️ Wpisy w rejestrze karnym', value: String(summary.records.length), inline: true }
      );
      await interaction.reply({ embeds: [idEmbed], ephemeral: true });
      return;
    }

    if (choice === 'check_vehicles') {
      const vehicles = vehicleService.listVehicles(interaction.guildId, interaction.user.id);
      if (!vehicles.length) {
        await interaction.reply({ embeds: [errorEmbed('Brak zarejestrowanych pojazdów.')], ephemeral: true });
        return;
      }
      const embeds = vehicles.slice(0, 10).map((v) => vehicleEmbed(v, interaction.user.id));
      await interaction.reply({ embeds, ephemeral: true });
      return;
    }
  },
};
