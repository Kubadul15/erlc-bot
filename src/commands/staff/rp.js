const { SlashCommandBuilder } = require('discord.js');
const { isStaff } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const rpService = require('../../services/rpService');
const { RP_JOIN_CODE_DEFAULT } = require('../../config/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rp')
    .setDescription('Zarządzanie sesją roleplay.')
    .addSubcommand((sub) =>
      sub
        .setName('start')
        .setDescription('Ogłoś start sesji roleplay.')
        .addStringOption((o) => o.setName('code').setDescription(`Kod serwera (domyślnie ${RP_JOIN_CODE_DEFAULT})`).setRequired(false).setMaxLength(50))
    )
    .addSubcommand((sub) => sub.setName('stop').setDescription('Ogłoś koniec sesji roleplay.')),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      if (rpService.isActive(interaction.guildId)) {
        await interaction.reply({
          embeds: [errorEmbed('Sesja roleplay już trwa. Użyj `/rp stop`, zanim rozpoczniesz nową.')],
          ephemeral: true,
        });
        return;
      }

      const code = interaction.options.getString('code') || RP_JOIN_CODE_DEFAULT;
      const result = await rpService.startSession(interaction.guild, interaction.user.id, code);

      if (!result.message) {
        await interaction.reply({
          embeds: [errorEmbed('Nie skonfigurowano kanału ogłoszeń RP. Ustaw go przez `/config set-channel key:rp_announce_channel_id`.')],
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({ embeds: [successEmbed(`Ogłoszono start roleplay na <#${result.message.channel.id}>.`)], ephemeral: true });
      return;
    }

    if (sub === 'stop') {
      if (!rpService.isActive(interaction.guildId)) {
        await interaction.reply({ embeds: [errorEmbed('Żadna sesja roleplay obecnie nie trwa.')], ephemeral: true });
        return;
      }

      const result = await rpService.stopSession(interaction.guild, interaction.user.id);

      if (!result.message) {
        await interaction.reply({
          embeds: [errorEmbed('Nie skonfigurowano kanału ogłoszeń RP. Ustaw go przez `/config set-channel key:rp_announce_channel_id`.')],
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({ embeds: [successEmbed(`Ogłoszono koniec roleplay na <#${result.message.channel.id}>.`)], ephemeral: true });
    }
  },
};
