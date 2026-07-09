const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');
const { build } = require('../utils/customId');
const applicationFields = require('../config/applicationFields');

async function showApplicationModal(interaction, type, extraIdPart) {
  const fields = applicationFields[type];
  const title = type === 'staff' ? 'Aplikacja — Staff' : 'Aplikacja — Frakcja';

  const idParts = ['app', 'modal', type];
  if (extraIdPart !== undefined) idParts.push(extraIdPart);

  const modal = new ModalBuilder().setCustomId(build(...idParts)).setTitle(title);

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

function readApplicationAnswers(interaction, type) {
  const fields = applicationFields[type];
  const answers = {};
  fields.forEach((field, index) => {
    const value = interaction.fields.getTextInputValue(`field_${index}`).trim();
    if (value) answers[field.id] = value;
  });
  return answers;
}

module.exports = { showApplicationModal, readApplicationAnswers };
