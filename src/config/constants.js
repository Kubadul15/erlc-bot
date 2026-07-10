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

  STAT_TYPES: {
    members: { label: 'Członkowie', emoji: '👥' },
    online: { label: 'Online', emoji: '🟢' },
    citizens: { label: 'Wyrobione dowody', emoji: '🪪' },
    tickets_open: { label: 'Otwarte tickety', emoji: '🎫' },
  },
  STAT_UPDATE_INTERVAL_MS: 10 * 60 * 1000, // 10 min - limit Discorda to 2 zmiany nazwy kanalu / 10 min

  RP_JOIN_CODE_DEFAULT: 'VortexRP',

  FACTION_PRESETS: [
    {
      name: 'Policja',
      shortName: 'POL',
      emoji: '👮',
      color: '#3498db',
      description: 'Utrzymanie porządku publicznego, interwencje i ściganie przestępców.',
    },
    {
      name: 'Straż Pożarna',
      shortName: 'SP',
      emoji: '🚒',
      color: '#e74c3c',
      description: 'Gaszenie pożarów, ratownictwo techniczne i usuwanie zagrożeń.',
    },
    {
      name: 'Straż Miejska',
      shortName: 'SM',
      emoji: '🚓',
      color: '#f1c40f',
      description: 'Nadzór nad porządkiem publicznym i przepisami lokalnymi.',
    },
    {
      name: 'GDDKiA',
      shortName: 'GDDKiA',
      emoji: '🚧',
      color: '#e67e22',
      description: 'Budowa, utrzymanie i zabezpieczanie infrastruktury drogowej.',
    },
    {
      name: 'Pogotowie Ratunkowe',
      shortName: 'PR',
      emoji: '🚑',
      color: '#2ecc71',
      description: 'Pomoc medyczna, ratownictwo i transport poszkodowanych.',
    },
  ],
};
