const { SlashCommandBuilder } = require('discord.js');
const { isAdmin } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const shopService = require('../../services/shopService');
const { CURRENCY_SYMBOL } = require('../../config/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sklep-admin')
    .setDescription('Zarządzanie katalogiem sklepu.')
    .addSubcommand((sub) =>
      sub
        .setName('dodaj')
        .setDescription('Dodaj nowy produkt do sklepu.')
        .addStringOption((o) => o.setName('nazwa').setDescription('Nazwa produktu').setRequired(true).setMaxLength(80))
        .addIntegerOption((o) => o.setName('cena').setDescription('Cena').setRequired(true).setMinValue(1))
        .addStringOption((o) => o.setName('opis').setDescription('Krótki opis').setRequired(false).setMaxLength(200))
        .addStringOption((o) => o.setName('emoji').setDescription('Emoji produktu, np. ⭐').setRequired(false).setMaxLength(10))
        .addStringOption((o) => o.setName('kolor').setDescription('Kolor roli hex, np. #f1c40f').setRequired(false))
        .addBooleanOption((o) =>
          o.setName('rola').setDescription('Czy zakup ma nadawać rolę? Bot sam ją utworzy na Discordzie (domyślnie tak).').setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('usun')
        .setDescription('Usuń produkt ze sklepu.')
        .addIntegerOption((o) => o.setName('id').setDescription('ID produktu').setRequired(true).setAutocomplete(true))
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const choices = shopService
      .listItems(interaction.guildId)
      .filter((i) => i.name.toLowerCase().includes((focused || '').toLowerCase()))
      .slice(0, 25)
      .map((i) => ({ name: `${i.name} — ${CURRENCY_SYMBOL}${i.price}`, value: i.id }));
    await interaction.respond(choices);
  },

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do tej komendy.')], ephemeral: true });
      return;
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'dodaj') {
      const name = interaction.options.getString('nazwa', true);
      const price = interaction.options.getInteger('cena', true);
      const description = interaction.options.getString('opis');
      const emoji = interaction.options.getString('emoji');
      const color = interaction.options.getString('kolor');
      const createRole = interaction.options.getBoolean('rola') ?? true;

      await interaction.deferReply({ ephemeral: true });

      const item = await shopService.createItem(interaction.guild, { name, description, price, emoji, color, createRole });

      const roleNote = item.role_id ? `\nUtworzono rolę <@&${item.role_id}> — zakup będzie ją automatycznie nadawać.` : '';
      await interaction.editReply({
        embeds: [successEmbed(`Dodano produkt **${name}** (${CURRENCY_SYMBOL}${price}) do sklepu.${roleNote}`)],
      });
      return;
    }

    if (sub === 'usun') {
      const itemId = interaction.options.getInteger('id', true);
      const item = shopService.getItem(itemId);
      if (!item) {
        await interaction.reply({ embeds: [errorEmbed('Nie znaleziono produktu.')], ephemeral: true });
        return;
      }
      shopService.removeItem(itemId);
      await interaction.reply({
        embeds: [successEmbed(`Usunięto **${item.name}** ze sklepu. Osoby, które już go kupiły, zachowują rolę.`)],
        ephemeral: true,
      });
    }
  },
};
