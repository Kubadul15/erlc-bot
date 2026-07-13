const { ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, StringSelectMenuBuilder } = require('discord.js');
const { divider, textDisplay, footerText, headerSection, mediaGallery, baseContainer, cardPayload, parseHexColor } = require('./cardKit');
const { build } = require('./customId');
const {
  BRAND_NAME,
  EMBED_COLOR,
  EMBED_COLOR_SUCCESS,
  EMBED_COLOR_DANGER,
  EMOJI,
  TICKET_CATEGORIES,
  DEFAULT_AVATAR_URL,
  CURRENCY_SYMBOL,
  ECONOMY_COLOR,
} = require('../config/constants');

// ---------- Obywatel: dowod osobisty i pojazdy ----------

function citizenIdCard({ citizen, discordId, avatarUrl, summary }) {
  const container = baseContainer(EMBED_COLOR)
    .addSectionComponents(
      headerSection(
        [`## 🪪 Dowód Osobisty — ${BRAND_NAME}`, `👤 Posiadacz: <@${discordId}>`],
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

// ---------- Weryfikacja (captcha + pseudonim) ----------

function verificationCaptchaCard({ code, actionRow }) {
  const spaced = code.split('').join(' ');
  const container = baseContainer(EMBED_COLOR)
    .addTextDisplayComponents(
      textDisplay(`## ✅ Weryfikacja — ${BRAND_NAME}`),
      textDisplay(
        `${EMOJI.info} Przepisz poniższy kod oraz podaj pseudonim, który ma zostać ustawiony jako Twój nick na serwerze.`
      )
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(textDisplay(`Kod weryfikacyjny:\n\`\`\`${spaced}\`\`\``))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText());

  if (actionRow) container.addActionRowComponents(actionRow);

  return cardPayload(container);
}

function verificationSuccessCard({ nickname, actionRow }) {
  const container = baseContainer(EMBED_COLOR_SUCCESS)
    .addTextDisplayComponents(
      textDisplay(`## ✅ Weryfikacja zakończona`),
      textDisplay(`${EMOJI.success} Zweryfikowano pomyślnie. Twój nick ustawiono na **${nickname}**.`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText());

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

// ---------- Ekonomia ----------
// Cala ekonomia dzieli jeden zloty akcent (ECONOMY_COLOR), zeby byla natychmiast
// rozpoznawalna wsrod reszty kart bota; wyniki pozytywnych akcji (praca, mandat)
// zostaja przy zielonym, bo to jest "sukces akcji", nie "waluta" sama w sobie.

function money(amount) {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('pl-PL')}`;
}

function walletCard({ discordId, avatarUrl, balance, recentTransactions }) {
  const container = baseContainer(ECONOMY_COLOR).addSectionComponents(
    headerSection(
      [`## 💰 Portfel`, `👤 <@${discordId}>\n**Saldo:** ${money(balance)}`],
      avatarUrl || DEFAULT_AVATAR_URL,
      'Avatar właściciela'
    )
  );

  container.addSeparatorComponents(divider());

  if (recentTransactions?.length) {
    const lines = recentTransactions
      .slice(0, 5)
      .map((t) => `${t.amount >= 0 ? '🟢 +' : '🔴 '}${money(t.amount)} — ${t.reason || t.type}`)
      .join('\n');
    container.addTextDisplayComponents(textDisplay(`**📜 Ostatnie transakcje**\n${lines}`)).addSeparatorComponents(divider());
  } else {
    container.addTextDisplayComponents(textDisplay('_Brak transakcji — spróbuj `/praca` albo `/nagroda-dzienna`._')).addSeparatorComponents(divider());
  }

  container.addTextDisplayComponents(footerText());
  return cardPayload(container);
}

function leaderboardCard(entries) {
  const medals = ['🥇', '🥈', '🥉'];
  const lines = entries.length
    ? entries.map((w, i) => `${medals[i] || `**#${i + 1}**`}  <@${w.discord_id}> — **${money(w.balance)}**`).join('\n')
    : '_Nikt jeszcze nic nie zarobił — bądź pierwszy!_';
  const totalPot = entries.reduce((sum, w) => sum + w.balance, 0);

  const container = baseContainer(ECONOMY_COLOR)
    .addTextDisplayComponents(textDisplay(`## 🏆 Ranking Najbogatszych`))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(textDisplay(lines))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(textDisplay(`💼 **Suma w obiegu (top ${entries.length}):** ${money(totalPot)}`))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText());

  return cardPayload(container);
}

function shopCard(items) {
  const container = baseContainer(ECONOMY_COLOR).addTextDisplayComponents(
    textDisplay(`## 🛒 Sklep — ${BRAND_NAME}`),
    textDisplay(items.length ? `Dostępne produkty: **${items.length}**. Wybierz jeden poniżej, aby go kupić.` : '_Sklep jest obecnie pusty — zajrzyj później!_')
  );

  if (items.length) {
    const lines = items
      .map((i, idx) => `**${idx + 1}.** ${i.emoji || '🏷️'} **${i.name}** — 💵 ${money(i.price)}${i.description ? `\n> ${i.description}` : ''}`)
      .join('\n\n');
    container.addSeparatorComponents(divider()).addTextDisplayComponents(textDisplay(lines));

    const select = new StringSelectMenuBuilder()
      .setCustomId(build('economy', 'shop', 'select'))
      .setPlaceholder('Wybierz produkt do kupienia...')
      .addOptions(
        items.slice(0, 25).map((i) => ({
          label: `${i.name} — ${money(i.price)}`,
          value: String(i.id),
          description: i.description ? i.description.slice(0, 100) : undefined,
          emoji: i.emoji || '🏷️',
        }))
      );
    container.addSeparatorComponents(divider()).addActionRowComponents(new ActionRowBuilder().addComponents(select));
  }

  container.addSeparatorComponents(divider()).addTextDisplayComponents(footerText());
  return cardPayload(container);
}

function dailyResultCard({ discordId, avatarUrl, amount, balance }) {
  const container = baseContainer(ECONOMY_COLOR)
    .addSectionComponents(
      headerSection([`## 🎁 Dzienna nagroda odebrana!`, `👤 <@${discordId}>`], avatarUrl || DEFAULT_AVATAR_URL, 'Avatar')
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(textDisplay(`💵 **Otrzymano:** +${money(amount)}`), textDisplay(`💰 **Nowe saldo:** ${money(balance)}`))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText('Wróć jutro po kolejną!'));
  return cardPayload(container);
}

function workResultCard({ discordId, avatarUrl, amount, flavorText, balance }) {
  const container = baseContainer(EMBED_COLOR_SUCCESS)
    .addSectionComponents(headerSection([`## 💼 Praca zakończona!`, `👤 <@${discordId}>`], avatarUrl || DEFAULT_AVATAR_URL, 'Avatar'))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`> ${flavorText}`),
      textDisplay(`💵 **Zarobiono:** +${money(amount)}`),
      textDisplay(`💰 **Nowe saldo:** ${money(balance)}`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText());
  return cardPayload(container);
}

function payResultCard({ fromId, toId, avatarUrl, amount, balance }) {
  const container = baseContainer(EMBED_COLOR)
    .addSectionComponents(
      headerSection([`## 💸 Przelew wykonany`, `👤 <@${fromId}> ➜ <@${toId}>`], avatarUrl || DEFAULT_AVATAR_URL, 'Avatar nadawcy')
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(textDisplay(`💵 **Kwota:** ${money(amount)}`), textDisplay(`💰 **Saldo nadawcy:** ${money(balance)}`))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText());
  return cardPayload(container);
}

function purchaseResultCard({ discordId, avatarUrl, item, balance }) {
  const container = baseContainer(ECONOMY_COLOR)
    .addSectionComponents(
      headerSection([`## ✅ Zakup zrealizowany!`, `👤 <@${discordId}>`], avatarUrl || DEFAULT_AVATAR_URL, 'Avatar kupującego')
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`${item.emoji || '🏷️'} **${item.name}**`),
      textDisplay(`💵 **Zapłacono:** ${money(item.price)}`),
      textDisplay(`💰 **Pozostałe saldo:** ${money(balance)}`),
      ...(item.role_id ? [textDisplay(`🎖️ Otrzymałeś rolę <@&${item.role_id}>!`)] : [])
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText('Dziękujemy za zakupy!'));
  return cardPayload(container);
}

function finePaymentResultCard({ discordId, avatarUrl, fine, balance }) {
  const container = baseContainer(EMBED_COLOR_SUCCESS)
    .addSectionComponents(headerSection([`## ✅ Mandat opłacony`, `👤 <@${discordId}>`], avatarUrl || DEFAULT_AVATAR_URL, 'Avatar'))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      textDisplay(`🔖 **Mandat:** #${fine.id}`),
      textDisplay(`💵 **Zapłacono:** ${money(fine.amount)}`),
      textDisplay(`💰 **Pozostałe saldo:** ${money(balance)}`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(footerText());
  return cardPayload(container);
}

module.exports = {
  citizenIdCard,
  vehicleCard,
  verificationCaptchaCard,
  verificationSuccessCard,
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
  walletCard,
  leaderboardCard,
  shopCard,
  dailyResultCard,
  workResultCard,
  payResultCard,
  purchaseResultCard,
  finePaymentResultCard,
};
