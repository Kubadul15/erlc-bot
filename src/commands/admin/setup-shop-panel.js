const { SlashCommandBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const guildSettings = require('../../database/repositories/guildSettings.repo');
const { isAdmin } = require('../../utils/permissions');
const { brandEmbed, errorEmbed } = require('../../utils/embeds');
const { BRAND_NAME, EMOJI } = require('../../config/constants');
const { build } = require('../../utils/customId');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-shop-panel')
    .setDescription('Publikuje panel sklepu serwera.')
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

    const embed = brandEmbed({
      title: `🛒 Sklep — ${BRAND_NAME}`,
      description:
        `Zarabiaj przez \`/praca\` i \`/nagroda-dzienna\`, a następnie wydaj środki tutaj.\n\n` +
        `Kliknij przycisk poniżej, aby otworzyć aktualną listę produktów.`,
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(build('economy', 'shop', 'open')).setLabel('Otwórz sklep').setStyle(ButtonStyle.Primary).setEmoji('🛒')
    );

    await channel.send({ embeds: [embed], components: [row] });

    guildSettings.set(interaction.guildId, 'shop_panel_channel_id', channel.id);

    await interaction.reply({
      embeds: [brandEmbed({ description: `${EMOJI.success} Panel sklepu opublikowany na <#${channel.id}>.` })],
      ephemeral: true,
    });
  },
};
