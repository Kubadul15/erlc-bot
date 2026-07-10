const { SlashCommandBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const guildSettings = require('../../database/repositories/guildSettings.repo');
const { isAdmin } = require('../../utils/permissions');
const { brandEmbed, errorEmbed } = require('../../utils/embeds');
const { BRAND_NAME, EMOJI } = require('../../config/constants');
const { build } = require('../../utils/customId');
const env = require('../../config/env');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-roblox-panel')
    .setDescription('Publikuje panel weryfikacji konta Roblox.')
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
      title: `🔗 Weryfikacja Konta Roblox — ${BRAND_NAME}`,
      description:
        `Kliknij przycisk poniżej i podaj swoją nazwę użytkownika Roblox.\n\n` +
        `Otrzymasz losowy kod — wklej go do sekcji **"O mnie"** na swoim profilu Roblox, zapisz zmiany, ` +
        `a następnie kliknij **Sprawdź ponownie**, aby potwierdzić, że konto należy do Ciebie.` +
        (env.verifiedRobloxRoleId ? `\n\nPo weryfikacji otrzymasz odpowiednią rolę na serwerze.` : ''),
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(build('citizen', 'link', 'continue')).setLabel('Zweryfikuj konto Roblox').setStyle(ButtonStyle.Primary).setEmoji('🔗')
    );

    await channel.send({ embeds: [embed], components: [row] });

    guildSettings.set(interaction.guildId, 'roblox_panel_channel_id', channel.id);

    await interaction.reply({
      embeds: [brandEmbed({ description: `${EMOJI.success} Panel weryfikacji Roblox opublikowany na <#${channel.id}>.` })],
      ephemeral: true,
    });
  },
};
