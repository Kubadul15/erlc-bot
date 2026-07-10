# Vortex ERLC — Bot Discord

Bot Discord dla prywatnego serwera **Vortex ERLC** (roleplay ERLC na Robloxie). Zawiera:

- 🏛️ **Panel Obywatela** — dowody osobiste, rejestracja pojazdów, podgląd własnych danych (select menu + modale).
- 🔗 **Weryfikacja konta Roblox** — przed wyrobieniem dowodu bot sprawdza w Roblox API, czy podana nazwa istnieje, pokazuje dane konta (avatar, nick) i wymaga wklejenia losowego kodu w opisie profilu, zanim uzna konto za powiązane.
- 🎫 **Zaawansowany system ticketów** — select menu z 6 kategoriami, prywatne kanały, claim/close/reopen/delete, transkrypty HTML+TXT.
- 💰 **Mandaty i rejestr karny** powiązane z dowodem osobistym.
- 🛡️ **System frakcji/prac** (LSPD, LSFD, DOT itd.) — rangi, awanse/degradacje, panel zarządzania członkami.
- ⚖️ **Panel moderacji** — warn/mute/unmute/ban/unban/kick z historią (`/modlog`).
- 📋 **System aplikacji/rekrutacji** — do staffu i do frakcji, z nowoczesnym interfejsem kart (Discord Components V2: kontenery, separatory, miniaturka avatara), akceptacją/odrzuceniem przez przyciski i kartami decyzji na DM.

Stack: **Node.js + discord.js v14 + better-sqlite3**.

## Wymagania

- Node.js 18+
- Aplikacja Discord z botem (Discord Developer Portal)

## Konfiguracja aplikacji Discord

1. Utwórz aplikację na https://discord.com/developers/applications, dodaj do niej bota.
2. W zakładce **Bot** włącz:
   - `Server Members Intent`
   - `Message Content Intent`
3. Wygeneruj link zaproszenia (OAuth2 → URL Generator):
   - Scopes: `bot`, `applications.commands`
   - Permissions: Manage Channels, Manage Roles, Send Messages, Embed Links, Attach Files, Read Message History, Moderate Members, Ban Members, Kick Members
4. Zaproś bota na serwer i upewnij się, że **rola bota jest wyżej** niż role frakcji/rang, które ma nadawać.

## Instalacja lokalna

```bash
npm install
cp .env.example .env
# uzupełnij DISCORD_TOKEN, CLIENT_ID, GUILD_ID w .env
npm run migrate
npm run deploy   # rejestruje slash commands na serwerze GUILD_ID
npm start
```

Po starcie bota, na serwerze:

1. `/setup-citizen-panel` — publikuje Panel Obywatela.
2. `/setup-ticket-panel` — publikuje panel ticketów.
3. `/setup-application-panel` — publikuje Centrum Rekrutacji (select menu Staff/Frakcja, klik → dopiero wtedy otwiera się formularz).
4. `/config set-role key:<...>` i `/config set-channel key:<...>` — skonfiguruj role i kanały (użyj `/config view`, aby zobaczyć aktualny stan). Bez skonfigurowanej `role_admin`/`role_staff` komendy administracyjne działają dla każdego z natywnym uprawnieniem **Manage Server**.

## Zmienne środowiskowe

| Zmienna | Opis |
|---|---|
| `DISCORD_TOKEN` | Token bota z Developer Portal |
| `CLIENT_ID` | ID aplikacji Discord |
| `GUILD_ID` | ID serwera deweloperskiego (rejestracja komend guild-scoped) |
| `DEPLOY_GLOBAL` | `true`/`false` — rejestracja komend globalnie zamiast na `GUILD_ID` |
| `DATABASE_PATH` | Ścieżka do pliku SQLite (lokalnie `./data/erlc.sqlite`) |
| `LOG_LEVEL` | `error` \| `warn` \| `info` \| `debug` |

## Deployment na Railway

1. Utwórz nowy projekt na [Railway](https://railway.app) z tego repozytorium GitHub.
2. Dodaj **Volume** i zamontuj go np. pod `/data`.
3. W zakładce **Variables** ustaw: `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID` (lub `DEPLOY_GLOBAL=true`), `DATABASE_PATH=/data/erlc.sqlite`, `LOG_LEVEL=info`.
4. Deploy — Railway użyje `railway.json` (Nixpacks, `npm start`). Przy każdym starcie bot automatycznie migruje bazę (`migrate()`) **i rejestruje slash commands** (`registerCommands()` w `src/events/ready.js`) — nie trzeba nic uruchamiać ręcznie, komendy pojawią się na serwerze chwilę po tym, jak bot zaloguje się i pokaże online.
5. Skonfiguruj panele i role komendami z sekcji powyżej.

Rejestracja komend jest idempotentna (nadpisuje cały zestaw), więc restart/redeploy bota jest bezpieczny i nie tworzy duplikatów. `npm run deploy` nadal istnieje jako opcjonalny, samodzielny skrypt CLI — przydatny do rejestracji globalnej (`DEPLOY_GLOBAL=true`, propagacja do godziny) bez restartu bota.

**Uwaga:** filesystem Railway jest efemeryczny przy każdym redeployu — bez zamontowanego Volume dane (dowody, pojazdy, tickety, mandaty itd.) zostaną utracone przy kolejnym wdrożeniu.

## Struktura projektu

```
src/
  index.js               # bootstrap klienta, ładowanie komend/interakcji/eventów
  deploy-commands.js     # rejestracja slash commands
  config/                # env, stałe marki, definicje pól modali
  database/               # połączenie SQLite, migracje, repozytoria
  services/               # logika biznesowa (citizen, vehicle, ticket, faction, moderation, application...)
  commands/                # slash commands, pogrupowane wg kategorii
  interactions/            # handlery przycisków / select menu / modali
  events/                  # eventy klienta discord.js
  utils/                   # embedy, uprawnienia, customId, czas, logger
```

## Komendy

| Komenda | Opis |
|---|---|
| `/link-roblox` | Powiąż nazwę użytkownika Roblox |
| `/setup-citizen-panel` | Publikuje Panel Obywatela |
| `/setup-ticket-panel` | Publikuje panel ticketów |
| `/setup-application-panel` | Publikuje Centrum Rekrutacji |
| `/config set-channel / set-role / view` | Konfiguracja bota |
| `/mandat`, `/rekord` | Mandaty i rejestr karny |
| `/warn`, `/mute`, `/unmute`, `/ban`, `/unban`, `/kick`, `/modlog` | Moderacja |
| `/frakcja create/delete/info/ranga/czlonek` | Zarządzanie frakcjami |
| `/frakcja-panel` | Panel zarządzania członkami frakcji |
| `/aplikacja-staff`, `/aplikacja-frakcja` | Aplikacje/rekrutacja |
| `/ping`, `/help` | Ogólne |
