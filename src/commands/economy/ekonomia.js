const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const economyService = require('../../services/economyService');
const { CURRENCY_SYMBOL } = require('../../config/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ekonomia')
    .setDescription('Zarządzanie ekonomią serwera (nadawanie/odbieranie środków).')
    .addSubcommand((sub) =>
      sub
        .setName('dodaj')
        .setDescription('Dodaj środki użytkownikowi.')
        .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true))
        .addIntegerOption((o) => o.setName('kwota').setDescription('Kwota').setRequired(true).setMinValue(1))
        .addStringOption((o) => o.setName('powod').setDescription('Powód').setRequired(false).setMaxLength(200))
    )
    .addSubcommand((sub) =>
      sub
        .setName('usun')
        .setDescription('Odbierz środki użytkownikowi.')
        .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true))
        .addIntegerOption((o) => o.setName('kwota').setDescription('Kwota').setRequired(true).setMinValue(1))
        .addStringOption((o) => o.setName('powod').setDescription('Powód').setRequired(false).setMaxLength(200))
    ),
  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('kwota', true);
    const reason = interaction.options.getString('powod') || 'Brak podanego powodu.';

    if (sub === 'dodaj') {
      const wallet = economyService.adminGrant(interaction.guildId, target.id, amount, interaction.user.id, reason);
      await interaction.reply({
        embeds: [successEmbed(`Dodano ${CURRENCY_SYMBOL}${amount} użytkownikowi <@${target.id}>. Nowe saldo: ${CURRENCY_SYMBOL}${wallet.balance}.`)],
      });
      return;
    }

    if (sub === 'usun') {
      const result = economyService.adminRemove(interaction.guildId, target.id, amount, interaction.user.id, reason);
      if (!result.ok) {
        await interaction.reply({ embeds: [errorEmbed('Ten użytkownik nie ma tylu środków.')], ephemeral: true });
        return;
      }
      await interaction.reply({
        embeds: [successEmbed(`Odebrano ${CURRENCY_SYMBOL}${amount} użytkownikowi <@${target.id}>. Nowe saldo: ${CURRENCY_SYMBOL}${result.wallet.balance}.`)],
      });
    }
  },
};
