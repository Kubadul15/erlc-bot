const { SlashCommandBuilder, ChannelType, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const guildSettings = require('../../database/repositories/guildSettings.repo');
const factionService = require('../../services/factionService');
const { isAdmin } = require('../../utils/permissions');
const { brandEmbed, errorEmbed } = require('../../utils/embeds');
const { BRAND_NAME, EMOJI, FACTION_PRESETS } = require('../../config/constants');
const { build } = require('../../utils/customId');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-faction-panel')
    .setDescription('Zasiewa domyślne frakcje i publikuje publiczny Panel Frakcji.')
    .addChannelOption((opt) =>
      opt
        .setName('channel')
        .setDescription('Kanał, na którym opublikować panel (domyślnie bieżący)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;

    let createdCount = 0;
    for (const preset of FACTION_PRESETS) {
      const { created } = factionService.getOrCreateFaction(interaction.guildId, preset);
      if (created) createdCount += 1;
    }

    const factions = factionService.listFactions(interaction.guildId);
    if (!factions.length) {
      await interaction.reply({ embeds: [errorEmbed('Brak frakcji do wyświetlenia.')], ephemeral: true });
      return;
    }

    const description = factions
      .map((f) => `${f.emoji || '🛡️'} **${f.name}**${f.short_name ? ` (${f.short_name})` : ''}${f.description ? `\n> ${f.description}` : ''}`)
      .join('\n\n');

    const embed = brandEmbed({
      title: `🛡️ Panel Frakcji — ${BRAND_NAME}`,
      description: `Wybierz frakcję poniżej, aby zobaczyć jej szczegóły.\n\n${description}`,
    });

    const select = new StringSelectMenuBuilder()
      .setCustomId(build('faction', 'directory', 'select'))
      .setPlaceholder('Wybierz frakcję, aby zobaczyć szczegóły...')
      .addOptions(
        factions.slice(0, 25).map((f) => ({
          label: f.name,
          value: String(f.id),
          description: f.short_name || undefined,
          emoji: f.emoji || '🛡️',
        }))
      );

    const row = new ActionRowBuilder().addComponents(select);
    await channel.send({ embeds: [embed], components: [row] });

    guildSettings.set(interaction.guildId, 'faction_panel_channel_id', channel.id);

    await interaction.reply({
      embeds: [
        brandEmbed({
          description:
            `${EMOJI.success} Panel Frakcji opublikowany na <#${channel.id}>.\n` +
            `Utworzono ${createdCount} nowych frakcji (${factions.length} łącznie).`,
        }),
      ],
      ephemeral: true,
    });
  },
};
