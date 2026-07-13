const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { build } = require('../utils/customId');

async function showIdModal(interaction) {
  const modal = new ModalBuilder().setCustomId(build('citizen', 'id', 'modal')).setTitle('Dowód Osobisty — Vortex ERLC');

  const fullName = new TextInputBuilder()
    .setCustomId('full_name')
    .setLabel('Imię i Nazwisko postaci')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(80)
    .setRequired(true);
  const age = new TextInputBuilder()
    .setCustomId('age')
    .setLabel('Wiek')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(3)
    .setRequired(true);
  const origin = new TextInputBuilder()
    .setCustomId('origin')
    .setLabel('Pochodzenie')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(60)
    .setRequired(true);
  const residence = new TextInputBuilder()
    .setCustomId('residence')
    .setLabel('Miejsce zamieszkania')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(60)
    .setRequired(true);
  const backstory = new TextInputBuilder()
    .setCustomId('backstory')
    .setLabel('Historia postaci')
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(4000)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(fullName),
    new ActionRowBuilder().addComponents(age),
    new ActionRowBuilder().addComponents(origin),
    new ActionRowBuilder().addComponents(residence),
    new ActionRowBuilder().addComponents(backstory)
  );

  await interaction.showModal(modal);
}

async function showVehicleModal(interaction) {
  const modal = new ModalBuilder().setCustomId(build('vehicle', 'register', 'modal')).setTitle('Rejestracja Pojazdu');

  const makeModel = new TextInputBuilder()
    .setCustomId('make_model')
    .setLabel('Marka i model')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(60)
    .setRequired(true);
  const plate = new TextInputBuilder()
    .setCustomId('plate')
    .setLabel('Tablica rejestracyjna')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(15)
    .setRequired(true);
  const info = new TextInputBuilder()
    .setCustomId('info')
    .setLabel('Kolor, rocznik, info')
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(4000)
    .setRequired(false);
  const photoUrl = new TextInputBuilder()
    .setCustomId('photo_url')
    .setLabel('Link do zdjęcia (URL lub puste)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(300)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(makeModel),
    new ActionRowBuilder().addComponents(plate),
    new ActionRowBuilder().addComponents(info),
    new ActionRowBuilder().addComponents(photoUrl)
  );

  await interaction.showModal(modal);
}

module.exports = { showIdModal, showVehicleModal };
