const { startsWith } = require('../../utils/customId');
const citizenService = require('../../services/citizenService');
const vehicleService = require('../../services/vehicleService');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  match: (customId) => startsWith(customId, 'vehicle', 'register', 'modal'),
  async execute(interaction) {
    const citizen = citizenService.getActiveCitizen(interaction.guildId, interaction.user.id);
    if (!citizen) {
      await interaction.reply({
        embeds: [errorEmbed('Musisz najpierw wyrobić dowód osobisty.')],
        ephemeral: true,
      });
      return;
    }

    const photoUrlRaw = interaction.fields.getTextInputValue('photo_url').trim();

    const data = {
      makeModel: interaction.fields.getTextInputValue('make_model').trim(),
      plate: interaction.fields.getTextInputValue('plate').trim(),
      info: interaction.fields.getTextInputValue('info').trim() || null,
      photoUrl: photoUrlRaw || null,
    };

    await vehicleService.registerVehicle(interaction.guild, interaction.user.id, citizen.id, data);

    await interaction.reply({
      embeds: [successEmbed('Pojazd został zarejestrowany.')],
      ephemeral: true,
    });
  },
};
