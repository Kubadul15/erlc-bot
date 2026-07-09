const { EmbedBuilder } = require('discord.js');
const { BRAND_NAME, EMBED_COLOR, EMOJI, TICKET_CATEGORIES } = require('../config/constants');

/** Bazowy embed marki - wszystkie inne buildery ponizej go opakowuja, zeby styl byl spojny. */
function brandEmbed({ title, description, color, fields, thumbnail, footer } = {}) {
  const embed = new EmbedBuilder()
    .setColor(color ?? EMBED_COLOR)
    .setFooter({ text: footer ?? BRAND_NAME })
    .setTimestamp();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (fields?.length) embed.addFields(fields);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

function robloxProfileLink(username) {
  const encoded = encodeURIComponent(username);
  return `[${username}](https://www.roblox.com/search/users?keyword=${encoded})`;
}

function citizenIdEmbed(citizen, discordId, robloxUsername) {
  return brandEmbed({
    title: `${EMOJI.id} Dowód Osobisty — ${BRAND_NAME}`,
    description:
      `> <@${discordId}>\n` +
      `> Roblox: ${robloxUsername ? robloxProfileLink(robloxUsername) : 'brak'}`,
    fields: [
      { name: '👤 Imię i Nazwisko', value: citizen.full_name, inline: false },
      { name: '🎂 Wiek', value: citizen.age, inline: true },
      { name: '🌍 Pochodzenie', value: citizen.origin, inline: true },
      { name: '🏠 Zamieszkanie', value: citizen.residence, inline: true },
      { name: '📖 Historia', value: citizen.backstory.slice(0, 1024) },
    ],
  });
}

function vehicleEmbed(vehicle, discordId) {
  const detailsParts = [];
  if (vehicle.info) detailsParts.push(vehicle.info);
  if (vehicle.color) detailsParts.push(`Kolor: ${vehicle.color}`);
  if (vehicle.year) detailsParts.push(`Rocznik: ${vehicle.year}`);

  const embed = brandEmbed({
    title: `${EMOJI.vehicle} Rejestracja Pojazdu — ${BRAND_NAME}`,
    description: `> <@${discordId}>`,
    fields: [
      { name: '🚗 Marka i model', value: vehicle.make_model, inline: true },
      { name: '🔖 Tablica rejestracyjna', value: vehicle.plate, inline: true },
      { name: 'ℹ️ Kolor, rocznik, info', value: detailsParts.join(' • ') || 'brak' },
    ],
  });
  if (vehicle.photo_url) embed.setImage(vehicle.photo_url);
  return embed;
}

function ticketIntroEmbed(category, openerId, answers) {
  const meta = TICKET_CATEGORIES[category];
  const fields = Object.entries(answers || {})
    .filter(([, v]) => v)
    .map(([name, value]) => ({ name, value: String(value).slice(0, 1024) }));

  return brandEmbed({
    title: `${meta.emoji} ${meta.label}`,
    description: `> Zgłaszający: <@${openerId}>\n> ${meta.description}`,
    color: meta.color,
    fields,
  });
}

function modActionEmbed({ action, targetId, staffId, reason, durationLabel }) {
  const actionLabels = {
    warn: `${EMOJI.warn} Ostrzeżenie`,
    mute: `${EMOJI.mute} Wyciszenie`,
    unmute: `${EMOJI.mute} Zdjęcie wyciszenia`,
    ban: `${EMOJI.ban} Ban`,
    unban: `${EMOJI.ban} Zdjęcie bana`,
    kick: `${EMOJI.kick} Wyrzucenie`,
  };
  const fields = [
    { name: 'Użytkownik', value: `<@${targetId}>`, inline: true },
    { name: 'Wystawił', value: `<@${staffId}>`, inline: true },
  ];
  if (durationLabel) fields.push({ name: 'Czas trwania', value: durationLabel, inline: true });
  fields.push({ name: 'Powód', value: reason });

  return brandEmbed({
    title: actionLabels[action] || action,
    color: action === 'unmute' || action === 'unban' ? require('../config/constants').EMBED_COLOR_SUCCESS : require('../config/constants').EMBED_COLOR_DANGER,
    fields,
  });
}

function applicationReviewEmbed({ type, applicantId, answers, factionName }) {
  const fields = Object.entries(answers)
    .filter(([, v]) => v)
    .map(([name, value]) => ({ name, value: String(value).slice(0, 1024) }));

  return brandEmbed({
    title: `${EMOJI.application} Nowa aplikacja: ${type === 'faction' ? factionName : 'Staff'}`,
    description: `> Aplikujący: <@${applicantId}>`,
    fields,
  });
}

function factionPanelEmbed(faction, members, ranks) {
  const rankNameById = new Map(ranks.map((r) => [r.id, r.name]));
  const memberLines = members.length
    ? members
        .map((m) => `<@${m.discord_id}> — **${rankNameById.get(m.rank_id) || '?'}**`)
        .join('\n')
    : 'Brak członków.';

  return brandEmbed({
    title: `${EMOJI.faction} ${faction.name}${faction.short_name ? ` (${faction.short_name})` : ''}`,
    description: 'Wybierz członka poniżej, aby zarządzać jego rangą.',
    fields: [{ name: `Członkowie (${members.length})`, value: memberLines.slice(0, 1024) }],
  });
}

function errorEmbed(message) {
  return brandEmbed({ description: `${EMOJI.error} ${message}`, color: require('../config/constants').EMBED_COLOR_DANGER });
}

function successEmbed(message) {
  return brandEmbed({ description: `${EMOJI.success} ${message}`, color: require('../config/constants').EMBED_COLOR_SUCCESS });
}

module.exports = {
  brandEmbed,
  robloxProfileLink,
  citizenIdEmbed,
  vehicleEmbed,
  ticketIntroEmbed,
  modActionEmbed,
  applicationReviewEmbed,
  factionPanelEmbed,
  errorEmbed,
  successEmbed,
};
