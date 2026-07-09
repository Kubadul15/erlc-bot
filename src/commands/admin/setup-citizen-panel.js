const {
  SlashCommandBuilder,
  ChannelType,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require('discord.js');
const guildSettings = require('../../database/repositories/guildSettings.repo');
const { isAdmin } = require('../../utils/permissions');
const { brandEmbed, errorEmbed } = require('../../utils/embeds');
const { EMOJI, CITIZEN_PANEL_OPTIONS, BRAND_NAME } = require('../../config/constants');
const { build } = require('../../utils/customId');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-citizen-panel')
    .setDescription('Publikuje Panel Obywatela na wskazanym kanale.')
    .addChannelOption((opt) =>
      opt
        .setName('channel')
        .setDescription('Kanał, na którym opublikować panel (domyślnie bieżący)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addChannelOption((opt) =>
      opt
        .setName('log_channel')
        .setDescription('Kanał, na który trafiają utworzone dowody osobiste (domyślnie ten sam co panel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addChannelOption((opt) =>
      opt
        .setName('vehicle_log_channel')
        .setDescription('Kanał, na który trafiają zarejestrowane pojazdy (domyślnie ten sam co panel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const logChannel = interaction.options.getChannel('log_channel');
    const vehicleLogChannel = interaction.options.getChannel('vehicle_log_channel');

    const embed = brandEmbed({
      title: `🏛️ Panel Obywatela — ${BRAND_NAME}`,
      description:
        `${EMOJI.id} Wyrób dowód\n` +
        `${EMOJI.vehicle} Zarejestruj pojazd\n` +
        `${EMOJI.search} Sprawdź swój dowód\n` +
        `${EMOJI.car} Sprawdź swoje pojazdy`,
    });

    const select = new StringSelectMenuBuilder()
      .setCustomId(build('citizen', 'panel', 'select'))
      .setPlaceholder('Wybierz opcję...')
      .addOptions(
        CITIZEN_PANEL_OPTIONS.map((o) => ({
          label: o.label,
          value: o.value,
          description: o.description,
          emoji: o.emoji,
        }))
      );

    const row = new ActionRowBuilder().addComponents(select);
    await channel.send({ embeds: [embed], components: [row] });

    guildSettings.set(interaction.guildId, 'citizen_panel_channel_id', channel.id);
    guildSettings.set(interaction.guildId, 'citizen_log_channel_id', (logChannel || channel).id);
    guildSettings.set(interaction.guildId, 'vehicle_log_channel_id', (vehicleLogChannel || channel).id);

    await interaction.reply({
      embeds: [
        brandEmbed({
          description:
            `${EMOJI.success} Panel Obywatela opublikowany na <#${channel.id}>.\n` +
            `🪪 Utworzone dowody będą trafiać na <#${(logChannel || channel).id}>.\n` +
            `🚓 Zarejestrowane pojazdy będą trafiać na <#${(vehicleLogChannel || channel).id}>.\n\n` +
            `Możesz to później zmienić przez \`/config set-channel\`.`,
        }),
      ],
      ephemeral: true,
    });
  },
};
