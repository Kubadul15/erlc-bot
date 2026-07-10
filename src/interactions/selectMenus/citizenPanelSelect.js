const { MessageFlags } = require('discord.js');
const { startsWith } = require('../../utils/customId');
const citizenService = require('../../services/citizenService');
const vehicleService = require('../../services/vehicleService');
const { errorEmbed } = require('../../utils/embeds');
const { citizenIdCard, vehicleCard } = require('../../utils/cards');
const { showIdModal, showVehicleModal } = require('../../services/citizenModals');

module.exports = {
  match: (customId) => startsWith(customId, 'citizen', 'panel', 'select'),
  async execute(interaction) {
    const choice = interaction.values[0];

    if (choice === 'id') {
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
      const roblox = citizenService.getVerifiedRoblox(interaction.guildId, interaction.user.id);
      const card = citizenIdCard({
        citizen: summary.citizen,
        discordId: interaction.user.id,
        robloxUsername: roblox?.roblox_username,
        avatarUrl: interaction.user.displayAvatarURL({ size: 128 }),
        summary,
      });
      await interaction.reply({ ...card, ephemeral: true });
      return;
    }

    if (choice === 'check_vehicles') {
      const vehicles = vehicleService.listVehicles(interaction.guildId, interaction.user.id);
      if (!vehicles.length) {
        await interaction.reply({ embeds: [errorEmbed('Brak zarejestrowanych pojazdów.')], ephemeral: true });
        return;
      }
      const containers = vehicles.slice(0, 10).flatMap((v) => vehicleCard({ vehicle: v, discordId: interaction.user.id }).components);
      await interaction.reply({ flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2, components: containers });
      return;
    }
  },
};
