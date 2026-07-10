const { SlashCommandBuilder, ChannelType, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const guildSettings = require('../../database/repositories/guildSettings.repo');
const factionService = require('../../services/factionService');
const { isAdmin } = require('../../utils/permissions');
const { brandEmbed, errorEmbed } = require('../../utils/embeds');
const { BRAND_NAME, EMOJI, DIVIDER } = require('../../config/constants');
const { build } = require('../../utils/customId');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-application-panel')
    .setDescription('Publikuje Centrum Rekrutacji (aplikacje do staffu i frakcji) na wskazanym kanale.')
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
    const factions = factionService.listFactions(interaction.guildId);

    const factionList = factions.length
      ? `\n\n**🛡️ Aktualnie rekrutujące frakcje:**\n${factions.map((f) => `• ${f.name}${f.short_name ? ` (${f.short_name})` : ''}`).join('\n')}`
      : '';

    const embed = brandEmbed({
      title: `${EMOJI.application} Centrum Rekrutacji — ${BRAND_NAME}`,
      description:
        `Chcesz dołączyć do zespołu staffu albo jednej z frakcji? Wybierz opcję poniżej, aby wypełnić formularz.\n\n` +
        `${DIVIDER}\n` +
        `🛠️ **Staff** — pomoc w moderacji i obsłudze społeczności.\n` +
        `🛡️ **Frakcja** — praca w LSPD, LSFD, DOT i innych służbach.\n` +
        `${DIVIDER}\n\n` +
        `Po wysłaniu formularza otrzymasz numer aplikacji i powiadomienie DM z decyzją staffu.` +
        factionList,
    });

    const select = new StringSelectMenuBuilder()
      .setCustomId(build('application', 'panel', 'select'))
      .setPlaceholder('Wybierz rodzaj aplikacji...')
      .addOptions([
        { label: 'Aplikacja do Staffu', value: 'staff', description: 'Dołącz do zespołu moderacji', emoji: '🛠️' },
        { label: 'Aplikacja do Frakcji', value: 'faction', description: 'Dołącz do jednej z frakcji serwera', emoji: '🛡️' },
      ]);

    const row = new ActionRowBuilder().addComponents(select);
    await channel.send({ embeds: [embed], components: [row] });

    guildSettings.set(interaction.guildId, 'application_panel_channel_id', channel.id);

    await interaction.reply({
      embeds: [brandEmbed({ description: `${EMOJI.success} Centrum Rekrutacji opublikowane na <#${channel.id}>.` })],
      ephemeral: true,
    });
  },
};
