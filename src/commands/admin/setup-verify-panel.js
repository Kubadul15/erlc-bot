const { SlashCommandBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const guildSettings = require('../../database/repositories/guildSettings.repo');
const { isAdmin } = require('../../utils/permissions');
const { brandEmbed, errorEmbed } = require('../../utils/embeds');
const { BRAND_NAME, EMOJI } = require('../../config/constants');
const { build } = require('../../utils/customId');
const env = require('../../config/env');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-verify-panel')
    .setDescription('Publikuje panel weryfikacji (captcha + pseudonim).')
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
      title: `✅ Weryfikacja — ${BRAND_NAME}`,
      description:
        `Kliknij przycisk poniżej, przepisz wyświetlony kod i podaj pseudonim, który ma zostać ustawiony jako Twój nick na serwerze.` +
        (env.verifiedRoleId ? `\n\nPo weryfikacji otrzymasz odpowiednią rolę na serwerze.` : ''),
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(build('verify', 'start')).setLabel('Zweryfikuj się').setStyle(ButtonStyle.Primary).setEmoji('✅')
    );

    await channel.send({ embeds: [embed], components: [row] });

    guildSettings.set(interaction.guildId, 'verify_panel_channel_id', channel.id);

    await interaction.reply({
      embeds: [brandEmbed({ description: `${EMOJI.success} Panel weryfikacji opublikowany na <#${channel.id}>.` })],
      ephemeral: true,
    });
  },
};
