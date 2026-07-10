module.exports = {
  BRAND_NAME: 'Vortex ERLC',
  EMBED_COLOR: 0x5865f2,
  EMBED_COLOR_SUCCESS: 0x57f287,
  EMBED_COLOR_DANGER: 0xed4245,
  EMBED_COLOR_WARNING: 0xfee75c,
  DEFAULT_AVATAR_URL: 'https://cdn.discordapp.com/embed/avatars/0.png', // fallback miniatury - Section w Components V2 wymaga akcesorium

  EMOJI: {
    id: '🪪',
    vehicle: '🚓',
    search: '🔍',
    car: '🚗',
    money: '💰',
    scale: '⚖️',
    ticket: '🎫',
    faction: '🛡️',
    application: '📋',
    warn: '⚠️',
    mute: '🔇',
    ban: '🔨',
    kick: '👢',
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  },

  CITIZEN_PANEL_OPTIONS: [
    { value: 'id', label: 'Wyrób dowód', description: 'Stwórz swój dowód osobisty postaci', emoji: '🪪' },
    { value: 'vehicle', label: 'Zarejestruj pojazd', description: 'Zarejestruj nowy pojazd na swoje dane', emoji: '🚓' },
    { value: 'check_id', label: 'Sprawdź swój dowód', description: 'Zobacz swój dowód osobisty', emoji: '🔍' },
    { value: 'check_vehicles', label: 'Sprawdź swoje pojazdy', description: 'Zobacz zarejestrowane pojazdy', emoji: '🚗' },
  ],

  TICKET_CATEGORIES: {
    general: { label: 'Pomoc ogólna', description: 'Ogólne pytania i problemy', emoji: '💬', color: 0x5865f2 },
    report: { label: 'Zgłoszenie gracza', description: 'Zgłoś złamanie zasad RP przez gracza', emoji: '🚨', color: 0xed4245 },
    appeal: { label: 'Odwołanie od bana/mute', description: 'Odwołaj się od nałożonej kary', emoji: '⚖️', color: 0xfee75c },
    bug: { label: 'Zgłoszenie buga', description: 'Zgłoś błąd bota lub serwera', emoji: '🐛', color: 0xeb459e },
    management: { label: 'Kontakt z zarządem', description: 'Poufny kontakt z wyższą administracją', emoji: '📁', color: 0x57f287 },
    shop: { label: 'Sklep / Doładowania', description: 'Pytania o zakupy, VIP, doładowania', emoji: '🛒', color: 0xf1c40f },
  },

  MAX_TIMEOUT_MS: 28 * 24 * 60 * 60 * 1000, // 28 dni - limit natywnego timeoutu Discorda

  DIVIDER: '◢▰▰▰▰▰▰▰ • ▰▰▰▰▰▰▰◣',

  APPLICATION_TYPE_LABELS: {
    staff: 'Staff',
    faction: 'Frakcja',
  },
};
