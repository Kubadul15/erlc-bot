const { SlashCommandBuilder, ChannelType, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const guildSettings = require('../../database/repositories/guildSettings.repo');
const { isAdmin } = require('../../utils/permissions');
const { brandEmbed, errorEmbed } = require('../../utils/embeds');
const { TICKET_CATEGORIES, BRAND_NAME, EMOJI } = require('../../config/constants');
const { build } = require('../../utils/customId');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-ticket-panel')
    .setDescription('Publikuje panel ticketów na wskazanym kanale.')
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

    const description = Object.values(TICKET_CATEGORIES)
      .map((c) => `${c.emoji} **${c.label}** — ${c.description}`)
      .join('\n');

    const embed = brandEmbed({
      title: `${EMOJI.ticket} Centrum Pomocy — ${BRAND_NAME}`,
      description: `Wybierz kategorię poniżej, aby otworzyć ticket:\n\n${description}`,
    });

    const select = new StringSelectMenuBuilder()
      .setCustomId(build('ticket', 'category', 'select'))
      .setPlaceholder('Wybierz kategorię ticketu...')
      .addOptions(
        Object.entries(TICKET_CATEGORIES).map(([value, meta]) => ({
          label: meta.label,
          value,
          description: meta.description,
          emoji: meta.emoji,
        }))
      );

    const row = new ActionRowBuilder().addComponents(select);
    await channel.send({ embeds: [embed], components: [row] });

    guildSettings.set(interaction.guildId, 'ticket_panel_channel_id', channel.id);

    await interaction.reply({
      embeds: [brandEmbed({ description: `${EMOJI.success} Panel ticketów opublikowany na <#${channel.id}>.` })],
      ephemeral: true,
    });
  },
};
