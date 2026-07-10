const { SlashCommandBuilder } = require('discord.js');
const { isAdmin, canManageFaction } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { factionInfoCard } = require('../../utils/cards');
const factionService = require('../../services/factionService');

function factionAutocompleteChoices(guildId, focusedValue) {
  return factionService
    .listFactions(guildId)
    .filter((f) => f.name.toLowerCase().includes((focusedValue || '').toLowerCase()))
    .slice(0, 25)
    .map((f) => ({ name: f.name, value: f.id }));
}

function rankAutocompleteChoices(factionId, focusedValue) {
  if (!factionId) return [];
  return factionService
    .listRanks(factionId)
    .filter((r) => r.name.toLowerCase().includes((focusedValue || '').toLowerCase()))
    .slice(0, 25)
    .map((r) => ({ name: `${r.name} (poziom ${r.level})`, value: r.id }));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('frakcja')
    .setDescription('Zarządzanie frakcjami (Policja, Straż Pożarna, Pogotowie itd.)')
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Utwórz nową frakcję.')
        .addStringOption((o) => o.setName('name').setDescription('Nazwa frakcji').setRequired(true).setMaxLength(80))
        .addStringOption((o) => o.setName('short_name').setDescription('Skrót, np. KMP').setRequired(false).setMaxLength(20))
        .addRoleOption((o) => o.setName('role').setDescription('Rola nadawana wszystkim członkom').setRequired(false))
        .addRoleOption((o) => o.setName('management_role').setDescription('Rola dowódcza (awanse/degradacje)').setRequired(false))
        .addStringOption((o) => o.setName('color').setDescription('Kolor hex, np. #1abc9c').setRequired(false))
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Usuń frakcję.')
        .addIntegerOption((o) => o.setName('faction').setDescription('Frakcja').setRequired(true).setAutocomplete(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('info')
        .setDescription('Pokaż informacje o frakcji.')
        .addIntegerOption((o) => o.setName('faction').setDescription('Frakcja').setRequired(true).setAutocomplete(true))
    )
    .addSubcommandGroup((group) =>
      group
        .setName('ranga')
        .setDescription('Zarządzanie rangami frakcji.')
        .addSubcommand((sub) =>
          sub
            .setName('dodaj')
            .setDescription('Dodaj nową rangę.')
            .addIntegerOption((o) => o.setName('faction').setDescription('Frakcja').setRequired(true).setAutocomplete(true))
            .addStringOption((o) => o.setName('name').setDescription('Nazwa rangi').setRequired(true).setMaxLength(60))
            .addIntegerOption((o) => o.setName('level').setDescription('Poziom (wyższy = wyższa ranga)').setRequired(true).setMinValue(0))
            .addRoleOption((o) => o.setName('role').setDescription('Rola Discord dla tej rangi').setRequired(false))
        )
        .addSubcommand((sub) =>
          sub
            .setName('usun')
            .setDescription('Usuń rangę.')
            .addIntegerOption((o) => o.setName('faction').setDescription('Frakcja').setRequired(true).setAutocomplete(true))
            .addIntegerOption((o) => o.setName('rank').setDescription('Ranga').setRequired(true).setAutocomplete(true))
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('czlonek')
        .setDescription('Zarządzanie członkami frakcji.')
        .addSubcommand((sub) =>
          sub
            .setName('dodaj')
            .setDescription('Dodaj członka do frakcji.')
            .addIntegerOption((o) => o.setName('faction').setDescription('Frakcja').setRequired(true).setAutocomplete(true))
            .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true))
            .addIntegerOption((o) => o.setName('rank').setDescription('Ranga (domyślnie najniższa)').setRequired(false).setAutocomplete(true))
        )
        .addSubcommand((sub) =>
          sub
            .setName('usun')
            .setDescription('Usuń członka z frakcji.')
            .addIntegerOption((o) => o.setName('faction').setDescription('Frakcja').setRequired(true).setAutocomplete(true))
            .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true))
        )
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    if (focused.name === 'faction') {
      await interaction.respond(factionAutocompleteChoices(interaction.guildId, focused.value));
      return;
    }
    if (focused.name === 'rank') {
      const factionId = interaction.options.getInteger('faction');
      await interaction.respond(rankAutocompleteChoices(factionId, focused.value));
      return;
    }
    await interaction.respond([]);
  },

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const group = interaction.options.getSubcommandGroup(false);

    if (sub === 'create') {
      if (!isAdmin(interaction.member)) {
        await interaction.reply({ embeds: [errorEmbed('Tylko administrator może tworzyć frakcje.')], ephemeral: true });
        return;
      }
      const name = interaction.options.getString('name', true);
      const shortName = interaction.options.getString('short_name');
      const role = interaction.options.getRole('role');
      const managementRole = interaction.options.getRole('management_role');
      const color = interaction.options.getString('color');

      factionService.createFaction(interaction.guildId, {
        name,
        shortName,
        color,
        roleId: role?.id,
        managementRoleId: managementRole?.id,
      });

      await interaction.reply({ embeds: [successEmbed(`Utworzono frakcję **${name}** z domyślną rangą "Rekrut".`)] });
      return;
    }

    if (sub === 'delete') {
      if (!isAdmin(interaction.member)) {
        await interaction.reply({ embeds: [errorEmbed('Tylko administrator może usuwać frakcje.')], ephemeral: true });
        return;
      }
      const factionId = interaction.options.getInteger('faction', true);
      const faction = factionService.getFaction(factionId);
      if (!faction) {
        await interaction.reply({ embeds: [errorEmbed('Nie znaleziono frakcji.')], ephemeral: true });
        return;
      }
      factionService.deleteFaction(factionId);
      await interaction.reply({ embeds: [successEmbed(`Usunięto frakcję **${faction.name}**.`)] });
      return;
    }

    if (sub === 'info') {
      const factionId = interaction.options.getInteger('faction', true);
      const faction = factionService.getFaction(factionId);
      if (!faction) {
        await interaction.reply({ embeds: [errorEmbed('Nie znaleziono frakcji.')], ephemeral: true });
        return;
      }
      const ranks = factionService.listRanks(factionId);
      const members = factionService.listMembers(factionId);

      await interaction.reply(factionInfoCard({ faction, ranks, members }));
      return;
    }

    if (group === 'ranga') {
      const factionId = interaction.options.getInteger('faction', true);
      const faction = factionService.getFaction(factionId);
      if (!faction) {
        await interaction.reply({ embeds: [errorEmbed('Nie znaleziono frakcji.')], ephemeral: true });
        return;
      }
      if (!canManageFaction(interaction.member, faction)) {
        await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do zarządzania rangami tej frakcji.')], ephemeral: true });
        return;
      }

      if (sub === 'dodaj') {
        const name = interaction.options.getString('name', true);
        const level = interaction.options.getInteger('level', true);
        const role = interaction.options.getRole('role');
        factionService.addRank(factionId, name, level, role?.id || null);
        await interaction.reply({ embeds: [successEmbed(`Dodano rangę **${name}** (poziom ${level}) do **${faction.name}**.`)] });
        return;
      }

      if (sub === 'usun') {
        const rankId = interaction.options.getInteger('rank', true);
        factionService.removeRank(rankId);
        await interaction.reply({ embeds: [successEmbed('Ranga usunięta.')] });
        return;
      }
    }

    if (group === 'czlonek') {
      const factionId = interaction.options.getInteger('faction', true);
      const faction = factionService.getFaction(factionId);
      if (!faction) {
        await interaction.reply({ embeds: [errorEmbed('Nie znaleziono frakcji.')], ephemeral: true });
        return;
      }
      if (!canManageFaction(interaction.member, faction)) {
        await interaction.reply({ embeds: [errorEmbed('Nie masz uprawnień do zarządzania członkami tej frakcji.')], ephemeral: true });
        return;
      }

      const targetUser = interaction.options.getUser('user', true);

      if (sub === 'dodaj') {
        let rankId = interaction.options.getInteger('rank');
        if (!rankId) {
          const lowest = factionService.getLowestRank(factionId);
          if (!lowest) {
            await interaction.reply({ embeds: [errorEmbed('Ta frakcja nie ma jeszcze żadnej rangi.')], ephemeral: true });
            return;
          }
          rankId = lowest.id;
        }
        await factionService.addMember(interaction.guild, factionId, targetUser.id, rankId);
        await interaction.reply({ embeds: [successEmbed(`Dodano <@${targetUser.id}> do **${faction.name}**.`)] });
        return;
      }

      if (sub === 'usun') {
        await factionService.removeMember(interaction.guild, factionId, targetUser.id);
        await interaction.reply({ embeds: [successEmbed(`Usunięto <@${targetUser.id}> z **${faction.name}**.`)] });
        return;
      }
    }
  },
};
