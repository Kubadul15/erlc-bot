const { ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder } = require('discord.js');
const { divider, textDisplay, footerText, headerSection, mediaGallery, baseContainer, cardPayload, parseHexColor } = require('./cardKit');
const { robloxProfileLink } = require('./embeds');
const { build } = require('./customId');
const {
  BRAND_NAME,
  EMBED_COLOR,
  EMBED_COLOR_SUCCESS,
  EMBED_COLOR_DANGER,
  EMOJI,
  TICKET_CATEGORIES,
  DEFAULT_AVATAR_URL,
} = require('../config/constants');

// ---------- Obywatel: dowod osobisty i pojazdy ----------

function citizenIdCard({ citizen, discordId, robloxUsername, avatarUrl, summary }) {
  const container = baseContainer(EMBED_COLOR)
    .addSectionComponents(
      headerSection(
        [
          `## 🪪 Dowód Osobisty — ${BRAND_NAME}`,
          `👤 Posiadacz: <@${discordId}>\n🎮 Roblox: ${robloxUsername ? robloxProfileLink(robloxUsername) : 'brak'}`,
        ],
        avatarUrl || DEFAULT_AVATAR_URL,
        'Avatar posiadacza'
      )
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`**Imię i Nazwisko**\n> ${citizen.full_name}`),
      textDisplay(`🎂 **Wiek:** ${citizen.age}  •  🌍 **Pochodzenie:** ${citizen.origin}  •  🏠 **Zamieszkanie:** ${citizen.residence}`),
      textDisplay(`**Historia**\n> ${citizen.backstory.slice(0, 1500).split('\n').join('\n> ')}`)
    );

  if (summary) {
    container
      .addSeparatorComponents(divider())
      .addTextDisplayComponents(
        textDisplay(
          `💰 **Nieopłacone mandaty:** $${summary.unpaidTotal} (${summary.fines.length} łącznie)  •  ⚖️ **Rejestr karny:** ${summary.records.length} wpisów`
        )
      );
  }

  container.addSeparatorComponents(divider()).addTextDisplayComponents(footerText());

  return cardPayload(container);
}

function vehicleCard({ vehicle, discordId }) {
  const details = [];
  if (vehicle.info) details.push(vehicle.info);
  if (vehicle.color) details.push(`Kolor: ${vehicle.color}`);
  if (vehicle.year) details.push(`Rocznik: ${vehicle.year}`);

  const container = baseContainer(EMBED_COLOR)
    .addTextDisplayComponents(
      textDisplay(`## 🚓 Rejestracja Pojazdu — ${BRAND_NAME}`),
      textDisplay(`👤 Właściciel: <@${discordId}>`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`🚗 **Marka i model:** ${vehicle.make_model}`),
      textDisplay(`🔖 **Tablica rejestracyjna:** ${vehicle.plate}`),
      textDisplay(`ℹ️ **Szczegóły:** ${details.join(' • ') || 'brak'}`)
    );

  if (vehicle.photo_url) {
    container.addSeparatorComponents(divider()).addMediaGalleryComponents(mediaGallery(vehicle.photo_url, 'Zdjęcie pojazdu'));
  }

  container.addSeparatorComponents(divider()).addTextDisplayComponents(footerText());

  return cardPayload(container);
}

// ---------- Powiazanie konta Roblox ----------

function robloxNotLinkedCard(actionRow) {
  const container = baseContainer(EMBED_COLOR)
    .addTextDisplayComponents(
      textDisplay(`## 🔗 Wymagane powiązanie konta Roblox`),
      textDisplay(
        `${EMOJI.info} Zanim wyrobisz dowód, musisz powiązać i zweryfikować swoją nazwę użytkownika Roblox.\nKliknij przycisk poniżej albo użyj komendy \`/link-roblox\`.`
      )
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText())
    .addActionRowComponents(actionRow);

  return cardPayload(container);
}

function robloxLinkCard({ resolved, avatarUrl, code, verified, actionRow }) {
  const container = baseContainer(verified ? EMBED_COLOR_SUCCESS : EMBED_COLOR)
    .addSectionComponents(
      headerSection(
        [
          `## 🔗 Powiązanie konta Roblox`,
          `👤 **Nazwa użytkownika:** ${resolved.name}\n🏷️ **Nazwa wyświetlana:** ${resolved.displayName || resolved.name}`,
        ],
        avatarUrl || DEFAULT_AVATAR_URL,
        'Avatar Roblox'
      )
    )
    .addSeparatorComponents(divider());

  if (verified) {
    container.addTextDisplayComponents(textDisplay(`${EMOJI.success} Konto zweryfikowane pomyślnie. Możesz kontynuować.`));
  } else {
    container.addTextDisplayComponents(
      textDisplay(
        `Aby potwierdzić, że to Twoje konto, wklej poniższy kod do sekcji **"O mnie"** na swoim profilu Roblox, zapisz zmiany, a następnie kliknij **Sprawdź ponownie**.`
      ),
      textDisplay(`Kod weryfikacyjny:\n\`\`\`${code}\`\`\``)
    );
  }

  container.addSeparatorComponents(divider()).addTextDisplayComponents(footerText());
  if (actionRow) container.addActionRowComponents(actionRow);

  return cardPayload(container);
}

// ---------- Tickety ----------

function ticketIntroCard({ ticketId, category, openerId, answers, claimedById, pingRoleId }) {
  const meta = TICKET_CATEGORIES[category];
  // Uwaga: wiadomosci Components V2 nie moga miec pola `content` (Discord je odrzuca),
  // wiec wzmianka pingujaca musi byc czescia Text Display - nadal wysyla powiadomienie.
  const pingLine = pingRoleId ? `<@&${pingRoleId}> • <@${openerId}>` : `<@${openerId}>`;

  const container = baseContainer(meta.color).addTextDisplayComponents(
    textDisplay(pingLine),
    textDisplay(`## ${meta.emoji} ${meta.label}`),
    textDisplay(`👤 Zgłaszający: <@${openerId}>\n🔖 Numer: #${ticketId}\n\n${meta.description}`)
  );

  const entries = Object.entries(answers || {}).filter(([, v]) => v);
  if (entries.length) {
    container.addSeparatorComponents(divider());
    for (const [question, answer] of entries) {
      container.addTextDisplayComponents(textDisplay(`**${question}**\n> ${String(answer).split('\n').join('\n> ')}`));
    }
  }

  const claimButton = claimedById
    ? new ButtonBuilder().setCustomId(build('ticket', 'claim', ticketId)).setLabel('Przejęte').setStyle(ButtonStyle.Secondary).setEmoji('🙋').setDisabled(true)
    : new ButtonBuilder().setCustomId(build('ticket', 'claim', ticketId)).setLabel('Przejmij').setStyle(ButtonStyle.Secondary).setEmoji('🙋');

  container
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText(claimedById ? `🟡 Przejęte przez <@${claimedById}>` : '🟢 Otwarty, oczekuje na staff'))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        claimButton,
        new ButtonBuilder().setCustomId(build('ticket', 'close', ticketId)).setLabel('Zamknij').setStyle(ButtonStyle.Danger).setEmoji('🔒')
      )
    );

  return cardPayload(container);
}

function ticketClosedCard({ ticketId, closedById }) {
  const container = baseContainer(EMBED_COLOR_DANGER)
    .addTextDisplayComponents(textDisplay(`🔒 **Ticket zamknięty** przez <@${closedById}>.`))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(build('ticket', 'reopen', ticketId)).setLabel('Otwórz ponownie').setStyle(ButtonStyle.Success).setEmoji('🔓'),
        new ButtonBuilder().setCustomId(build('ticket', 'delete', ticketId)).setLabel('Usuń kanał').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
      )
    );
  return cardPayload(container);
}

function ticketReopenedCard() {
  return cardPayload(baseContainer(EMBED_COLOR_SUCCESS).addTextDisplayComponents(textDisplay('🔓 **Ticket otwarty ponownie.**')));
}

function ticketTranscriptCard({ ticketId, category, openerId, closedById, messageCount }) {
  const meta = TICKET_CATEGORIES[category] || {};
  const container = baseContainer(EMBED_COLOR)
    .addTextDisplayComponents(textDisplay(`## ${meta.emoji || '🎫'} Transkrypt ticketu #${ticketId}`))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`📁 **Kategoria:** ${meta.label || category}`),
      textDisplay(`👤 **Otwierający:** <@${openerId}>`),
      textDisplay(`🔒 **Zamknięty przez:** <@${closedById}>`),
      textDisplay(`💬 **Wiadomości:** ${messageCount ?? '?'}`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText());
  return cardPayload(container);
}

// ---------- Moderacja ----------

const MOD_ACTION_LABELS = {
  warn: `${EMOJI.warn} Ostrzeżenie`,
  mute: `${EMOJI.mute} Wyciszenie`,
  unmute: `${EMOJI.mute} Zdjęcie wyciszenia`,
  ban: `${EMOJI.ban} Ban`,
  unban: `${EMOJI.ban} Zdjęcie bana`,
  kick: `${EMOJI.kick} Wyrzucenie`,
};
const MOD_ACTION_POSITIVE = new Set(['unmute', 'unban']);

function modActionCard({ action, targetId, staffId, reason, durationLabel }) {
  const color = MOD_ACTION_POSITIVE.has(action) ? EMBED_COLOR_SUCCESS : EMBED_COLOR_DANGER;
  const container = baseContainer(color)
    .addTextDisplayComponents(textDisplay(`## ${MOD_ACTION_LABELS[action] || action}`))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`👤 **Użytkownik:** <@${targetId}>`),
      textDisplay(`🛡️ **Wystawił:** <@${staffId}>`),
      ...(durationLabel ? [textDisplay(`⏱️ **Czas trwania:** ${durationLabel}`)] : []),
      textDisplay(`**Powód**\n> ${reason}`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText());
  return cardPayload(container);
}

// ---------- Frakcje ----------

function factionPanelCard({ faction, members, ranks }) {
  const rankNameById = new Map(ranks.map((r) => [r.id, r.name]));
  const memberLines = members.length
    ? members.map((m) => `<@${m.discord_id}> — **${rankNameById.get(m.rank_id) || '?'}**`).join('\n')
    : 'Brak członków.';

  const container = baseContainer(parseHexColor(faction.color, EMBED_COLOR))
    .addTextDisplayComponents(
      textDisplay(`## ${faction.emoji || EMOJI.faction} ${faction.name}${faction.short_name ? ` (${faction.short_name})` : ''}`),
      textDisplay('Wybierz członka poniżej, aby zarządzać jego rangą.')
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(textDisplay(`**Członkowie (${members.length})**\n${memberLines.slice(0, 1500)}`))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new UserSelectMenuBuilder().setCustomId(build('faction', 'select-member', faction.id)).setPlaceholder('Wybierz członka do zarządzania...')
      )
    );

  return cardPayload(container);
}

function factionInfoCard({ faction, ranks, members }) {
  const rankList = ranks.map((r) => `• ${r.name} (poziom ${r.level})${r.role_id ? ` — <@&${r.role_id}>` : ''}`).join('\n') || 'Brak rang.';

  const container = baseContainer(parseHexColor(faction.color, EMBED_COLOR)).addTextDisplayComponents(
    textDisplay(`## ${faction.emoji || '🛡️'} ${faction.name}${faction.short_name ? ` (${faction.short_name})` : ''}`)
  );

  if (faction.description) {
    container.addTextDisplayComponents(textDisplay(faction.description));
  }

  container
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`🎖️ **Rola bazowa:** ${faction.role_id ? `<@&${faction.role_id}>` : 'brak'}`),
      textDisplay(`⭐ **Rola dowódcza:** ${faction.management_role_id ? `<@&${faction.management_role_id}>` : 'brak'}`),
      textDisplay(`👥 **Liczba członków:** ${members.length}`),
      textDisplay(`**Rangi**\n${rankList}`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText());

  return cardPayload(container);
}

// ---------- Sesje RP ----------

function rpStartCard({ staffId, code, pingRoleId }) {
  const container = baseContainer(EMBED_COLOR_SUCCESS).addTextDisplayComponents(
    ...(pingRoleId ? [textDisplay(`<@&${pingRoleId}>`)] : []),
    textDisplay(`## 🟢 Roleplay wystartował!`)
  );

  container
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`🔑 **Kod serwera:** \`${code}\``),
      textDisplay(`👤 **Rozpoczęte przez:** <@${staffId}>`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText('Do zobaczenia w grze!'));

  return cardPayload(container);
}

function rpStopCard({ staffId, durationLabel }) {
  const container = baseContainer(EMBED_COLOR_DANGER)
    .addTextDisplayComponents(textDisplay(`## 🔴 Roleplay zakończony`))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`👤 **Zakończone przez:** <@${staffId}>`),
      ...(durationLabel ? [textDisplay(`⏱️ **Czas trwania:** ${durationLabel}`)] : [])
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText('Dziękujemy za grę!'));

  return cardPayload(container);
}

// ---------- Przyloty / odloty (dolaczenie i opuszczenie serwera) ----------

function memberArrivalCard({ userId, tag, avatarUrl, accountCreatedAt, memberCount }) {
  const unixSeconds = Math.floor(accountCreatedAt / 1000);

  const container = baseContainer(EMBED_COLOR_SUCCESS)
    .addSectionComponents(
      headerSection(
        [`## 🛬 Ktoś wbił na serwer!`, `👤 <@${userId}> — **${tag}**`],
        avatarUrl || DEFAULT_AVATAR_URL,
        'Avatar nowego członka'
      )
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`🎂 **Konto założone:** <t:${unixSeconds}:R>`),
      textDisplay(`👥 **Jesteście teraz:** ${memberCount} członków`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText('Witaj na pokładzie!'));

  return cardPayload(container);
}

function memberDepartureCard({ userId, tag, avatarUrl, memberCount, durationLabel }) {
  const container = baseContainer(EMBED_COLOR_DANGER)
    .addSectionComponents(
      headerSection([`## 🛫 Ktoś wyszedł...`, `👤 **${tag}** (\`${userId}\`)`], avatarUrl || DEFAULT_AVATAR_URL, 'Avatar odchodzącego członka')
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      ...(durationLabel ? [textDisplay(`⏳ **Był z nami:** ${durationLabel}`)] : []),
      textDisplay(`👥 **Zostało:** ${memberCount} członków`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText('Do zobaczenia!'));

  return cardPayload(container);
}

module.exports = {
  citizenIdCard,
  vehicleCard,
  robloxNotLinkedCard,
  robloxLinkCard,
  ticketIntroCard,
  ticketClosedCard,
  ticketReopenedCard,
  ticketTranscriptCard,
  modActionCard,
  factionPanelCard,
  factionInfoCard,
  rpStartCard,
  rpStopCard,
  memberArrivalCard,
  memberDepartureCard,
};
