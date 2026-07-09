const { SlashCommandBuilder, ChannelType } = require('discord.js');
const guildSettings = require('../../database/repositories/guildSettings.repo');
const { isAdmin } = require('../../utils/permissions');
const { errorEmbed, successEmbed, brandEmbed } = require('../../utils/embeds');
const { CONFIG_KEYS } = require('../../services/configService');

const channelChoices = Object.entries(CONFIG_KEYS.channels).map(([key, label]) => ({ name: label, value: key }));
const roleChoices = Object.entries(CONFIG_KEYS.roles).map(([key, label]) => ({ name: label, value: key }));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Konfiguracja bota (kanały i role).')
    .addSubcommand((sub) =>
      sub
        .setName('set-channel')
        .setDescription('Ustaw kanał dla danego klucza konfiguracji.')
        .addStringOption((o) => o.setName('key').setDescription('Klucz konfiguracji').setRequired(true).addChoices(...channelChoices))
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Kanał').setRequired(true).addChannelTypes(ChannelType.GuildText, ChannelType.GuildCategory)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('set-role')
        .setDescription('Ustaw rolę dla danego klucza konfiguracji.')
        .addStringOption((o) => o.setName('key').setDescription('Klucz konfiguracji').setRequired(true).addChoices(...roleChoices))
        .addRoleOption((o) => o.setName('role').setDescription('Rola').setRequired(true))
    )
    .addSubcommand((sub) => sub.setName('view').setDescription('Pokaż aktualną konfigurację bota.')),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'set-channel') {
      const key = interaction.options.getString('key', true);
      const channel = interaction.options.getChannel('channel', true);
      guildSettings.set(interaction.guildId, key, channel.id);
      await interaction.reply({ embeds: [successEmbed(`Ustawiono **${CONFIG_KEYS.channels[key]}** na <#${channel.id}>.`)], ephemeral: true });
      return;
    }

    if (sub === 'set-role') {
      const key = interaction.options.getString('key', true);
      const role = interaction.options.getRole('role', true);
      guildSettings.set(interaction.guildId, key, role.id);
      await interaction.reply({ embeds: [successEmbed(`Ustawiono **${CONFIG_KEYS.roles[key]}** na <@&${role.id}>.`)], ephemeral: true });
      return;
    }

    if (sub === 'view') {
      const all = guildSettings.getAll(interaction.guildId);
      const lines = all.length
        ? all.map((row) => {
            const label = CONFIG_KEYS.channels[row.key] || CONFIG_KEYS.roles[row.key] || row.key;
            const isRole = Boolean(CONFIG_KEYS.roles[row.key]);
            const mention = isRole ? `<@&${row.value}>` : `<#${row.value}>`;
            return `**${label}**: ${mention}`;
          })
        : ['Brak skonfigurowanych ustawień.'];

      await interaction.reply({
        embeds: [brandEmbed({ title: '⚙️ Konfiguracja bota', description: lines.join('\n') })],
        ephemeral: true,
      });
    }
  },
};
