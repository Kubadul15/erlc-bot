const { SlashCommandBuilder } = require('discord.js');
const citizenService = require('../../services/citizenService');
const { successEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link-roblox')
    .setDescription('Powiąż swoją nazwę użytkownika Roblox z kontem Discord.')
    .addStringOption((opt) =>
      opt.setName('username').setDescription('Twoja nazwa użytkownika na Robloxie').setRequired(true).setMaxLength(50)
    ),
  async execute(interaction) {
    const username = interaction.options.getString('username', true).trim();
    citizenService.linkRoblox(interaction.guildId, interaction.user.id, username);
    await interaction.reply({
      embeds: [successEmbed(`Powiązano konto Roblox: **${username}**.`)],
      ephemeral: true,
    });
  },
};
