const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const robloxLinkService = require('../../services/robloxLinkService');
const { errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link-roblox')
    .setDescription('Powiąż i zweryfikuj swoją nazwę użytkownika Roblox.')
    .addStringOption((opt) =>
      opt.setName('username').setDescription('Twoja nazwa użytkownika na Robloxie').setRequired(true).setMaxLength(50)
    ),
  async execute(interaction) {
    const username = interaction.options.getString('username', true).trim();

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const result = await robloxLinkService.startLinking(interaction.guildId, interaction.user.id, username);
    if (!result.ok) {
      await interaction.editReply({
        embeds: [errorEmbed('Nie znaleziono takiego użytkownika Roblox. Sprawdź pisownię i spróbuj ponownie.')],
      });
      return;
    }

    await interaction.editReply(result.card);
  },
};
