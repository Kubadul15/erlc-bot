const { startsWith } = require('../../utils/customId');
const citizenService = require('../../services/citizenService');
const { successEmbed } = require('../../utils/embeds');

module.exports = {
  match: (customId) => startsWith(customId, 'citizen', 'id', 'modal'),
  async execute(interaction) {
    const data = {
      fullName: interaction.fields.getTextInputValue('full_name').trim(),
      age: interaction.fields.getTextInputValue('age').trim(),
      origin: interaction.fields.getTextInputValue('origin').trim(),
      residence: interaction.fields.getTextInputValue('residence').trim(),
      backstory: interaction.fields.getTextInputValue('backstory').trim(),
    };

    await citizenService.createCitizen(interaction.guild, interaction.user.id, data);

    await interaction.reply({
      embeds: [successEmbed('Twój dowód osobisty został utworzony.')],
      ephemeral: true,
    });
  },
};
