const { SlashCommandBuilder } = require('discord.js');
const { brandEmbed } = require('../../utils/embeds');
const { BRAND_NAME } = require('../../config/constants');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Pokaż listę dostępnych komend.'),
  async execute(interaction) {
    const embed = brandEmbed({
      title: `📖 Pomoc — ${BRAND_NAME}`,
      description: 'Lista dostępnych komend, pogrupowana wg kategorii.',
      fields: [
        {
          name: '🏛️ Obywatel',
          value: 'Użyj Panelu Obywatela na kanale, aby wyrobić dowód, zarejestrować pojazd i sprawdzić swoje dane.',
        },
        {
          name: '🔗 Weryfikacja Roblox',
          value:
            '`/link-roblox` albo Panel Weryfikacji Roblox na kanale — osobny, opcjonalny krok niepowiązany z wyrobieniem dowodu.',
        },
        {
          name: '🎫 Tickety',
          value: 'Użyj panelu ticketów, aby otworzyć zgłoszenie w wybranej kategorii.',
        },
        {
          name: '🛡️ Frakcje',
          value: 'Użyj Panelu Frakcji na kanale, aby zobaczyć informacje o Policji, Straży Pożarnej, Straży Miejskiej, GDDKiA i Pogotowiu Ratunkowym.',
        },
        {
          name: '📋 Aplikacje',
          value:
            'Użyj Centrum Rekrutacji na kanale (wybierz Staff/Frakcja z select menu), albo bezpośrednio: `/aplikacja-staff`, `/aplikacja-frakcja`.',
        },
        {
          name: '💰 Ekonomia',
          value:
            '`/saldo`, `/nagroda-dzienna`, `/praca`, `/przelew`, `/ranking`\n`/sklep` albo panel sklepu na kanale — kup produkty, niektóre nadają rangi\n`/moje-mandaty`, `/zaplac-mandat` — opłać mandat z portfela',
        },
        {
          name: '🛡️ Staff',
          value:
            '`/mandat`, `/rekord`, `/warn`, `/mute`, `/unmute`, `/ban`, `/unban`, `/kick`, `/modlog`\n`/frakcja`, `/frakcja-panel`\n`/rp start`, `/rp stop` — ogłoś start/koniec sesji roleplay\n`/ekonomia dodaj/usun` — zarządzaj saldem gracza',
        },
        {
          name: '⚙️ Administracja',
          value:
            '`/config`, `/setup-citizen-panel`, `/setup-roblox-panel`, `/setup-ticket-panel`, `/setup-application-panel`, `/setup-faction-panel`, `/setup-stats-panel`, `/setup-shop-panel`, `/sklep-admin dodaj/usun`',
        },
      ],
    });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
