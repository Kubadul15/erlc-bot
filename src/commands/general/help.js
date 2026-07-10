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
          value: '`/link-roblox` — powiąż konto Roblox\nUżyj Panelu Obywatela na kanale, aby wyrobić dowód, zarejestrować pojazd i sprawdzić swoje dane.',
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
          name: '🛡️ Staff',
          value:
            '`/mandat`, `/rekord`, `/warn`, `/mute`, `/unmute`, `/ban`, `/unban`, `/kick`, `/modlog`\n`/frakcja`, `/frakcja-panel`',
        },
        {
          name: '⚙️ Administracja',
          value: '`/config`, `/setup-citizen-panel`, `/setup-ticket-panel`, `/setup-application-panel`, `/setup-faction-panel`',
        },
      ],
    });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
