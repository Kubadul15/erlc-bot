const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const statChannelsRepo = require('../../database/repositories/statChannels.repo');
const statsService = require('../../services/statsService');
const { isAdmin } = require('../../utils/permissions');
const { brandEmbed, errorEmbed } = require('../../utils/embeds');
const { STAT_TYPES, EMOJI } = require('../../config/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-stats-panel')
    .setDescription('Tworzy kanały głosowe ze statystykami serwera, które same się aktualizują.')
    .addChannelOption((opt) =>
      opt
        .setName('category')
        .setDescription('Kategoria, w której utworzyć kanały (domyślnie nowa "📊 Statystyki")')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    let category = interaction.options.getChannel('category');
    if (!category) {
      category = await interaction.guild.channels.create({ name: '📊 Statystyki', type: ChannelType.GuildCategory });
    }

    let createdCount = 0;
    const skipped = [];

    for (const [statType, meta] of Object.entries(STAT_TYPES)) {
      const existing = statChannelsRepo.getByGuildAndType(interaction.guildId, statType);
      if (existing) {
        skipped.push(meta.label);
        continue;
      }

      const value = await statsService.computeStatValue(interaction.guild, statType);
      const channel = await interaction.guild.channels.create({
        name: statsService.buildChannelName(statType, value),
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [{ id: interaction.guild.roles.everyone.id, deny: [PermissionsBitField.Flags.Connect] }],
      });

      statChannelsRepo.create(interaction.guildId, channel.id, statType);
      createdCount += 1;
    }

    const lines = [`${EMOJI.success} Utworzono ${createdCount} nowych kanałów statystyk w <#${category.id}>.`];
    if (skipped.length) lines.push(`Pominięto (już istnieją): ${skipped.join(', ')}.`);
    lines.push('Kanały aktualizują się automatycznie co 10 minut.');

    await interaction.editReply({ embeds: [brandEmbed({ description: lines.join('\n') })] });
  },
};
