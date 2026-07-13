const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');
const { build } = require('../utils/customId');
const ticketFields = require('../config/ticketFields');
const { TICKET_CATEGORIES } = require('../config/constants');

/** customId dla kazdego TextInput to indeks pola w tablicy - trzymamy nazwe pola osobno do etykietowania. */
async function showCategoryModal(interaction, category) {
  const fields = ticketFields[category];
  const meta = TICKET_CATEGORIES[category];
  if (!fields || !meta) return;

  const modal = new ModalBuilder().setCustomId(build('ticket', 'modal', category)).setTitle(meta.label.slice(0, 45));

  fields.forEach((field, index) => {
    const input = new TextInputBuilder()
      .setCustomId(`field_${index}`)
      .setLabel(field.label.slice(0, 45))
      .setStyle(field.style)
      .setMaxLength(field.maxLength || 1000)
      .setRequired(field.required);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
  });

  await interaction.showModal(modal);
}

function readCategoryAnswers(interaction, category) {
  const fields = ticketFields[category];
  const answers = {};
  fields.forEach((field, index) => {
    const value = interaction.fields.getTextInputValue(`field_${index}`).trim();
    if (value) answers[field.id] = value;
  });
  return answers;
}

module.exports = { showCategoryModal, readCategoryAnswers };
