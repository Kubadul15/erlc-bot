# Vortex ERLC — Bot Discord

Bot Discord dla prywatnego serwera **Vortex ERLC** (roleplay ERLC na Robloxie). Cały interfejs — dowody, pojazdy, tickety, moderacja, frakcje, ekonomia — zbudowany jest na Discord **Components V2** (kontenery, separatory, sekcje z miniaturką), nie na zwykłych embedach. Zawiera:

- 🏛️ **Panel Obywatela** — dowody osobiste, rejestracja pojazdów, podgląd własnych danych (select menu + modale + karty V2). Wyrobienie dowodu nie wymaga powiązania Roblox — to osobny, niezależny krok.
- 🔗 **Panel weryfikacji Roblox** (`/setup-roblox-panel`) — osobny panel: bot sprawdza w Roblox API, czy podana nazwa istnieje, pokazuje dane konta (avatar, nick) i wymaga wklejenia losowego kodu w opisie profilu. Po weryfikacji nadaje rolę skonfigurowaną w `VERIFIED_ROBLOX_ROLE_ID`.
- 🎫 **Zaawansowany system ticketów** — select menu z 6 kategoriami, prywatne kanały, claim/close/reopen/delete, transkrypty HTML+TXT.
- 💰 **Mandaty i rejestr karny** powiązane z dowodem osobistym.
- 🛡️ **System frakcji/prac** — domyślnie Policja, Straż Pożarna, Straż Miejska, GDDKiA, Pogotowie Ratunkowe (`/setup-faction-panel` zasiewa je automatycznie), plus dowolne własne frakcje. Publiczny **Panel Frakcji** do przeglądania, osobny panel zarządzania członkami (rangi, awanse/degradacje) dla dowódców.
- ⚖️ **Panel moderacji** — warn/mute/unmute/ban/unban/kick z historią (`/modlog`).
- 📊 **Statystyki serwera** — kanały głosowe (członkowie, online, wyrobione dowody, otwarte tickety) które same aktualizują nazwę co 10 minut (`/setup-stats-panel`).
- 🎬 **Sesje RP** — `/rp start [kod]` i `/rp stop` ogłaszają start/koniec sesji roleplay na skonfigurowanym kanale, z pingiem roli i domyślnym kodem serwera.
- 🛬🛫 **Przyloty / odloty** — automatyczne karty na dołączenie i opuszczenie serwera (avatar, wiek konta, licznik członków, czas spędzony na serwerze), na kanały z `ARRIVALS_CHANNEL_ID` / `DEPARTURES_CHANNEL_ID`.
- 💰 **Ekonomia** — portfele, `/nagroda-dzienna`, `/praca` (z losowym tekstem fabularnym i cooldownem), `/przelew`, `/ranking`, `/zaplac-mandat` (płatność mandatu bezpośrednio z portfela). **Sklep** (`/sklep`, `/setup-shop-panel`) z produktami zarządzanymi przez `/sklep-admin` — jeśli produkt ma nadawać rangę, **bot sam tworzy tę rolę na Discordzie** i nadaje ją automatycznie po zakupie. `/ekonomia dodaj/usun` do ręcznego zarządzania saldem przez staff.

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
2. `/setup-roblox-panel` — publikuje osobny panel weryfikacji konta Roblox.
3. `/setup-ticket-panel` — publikuje panel ticketów.
4. `/setup-faction-panel` — zasiewa domyślne frakcje (Policja, Straż Pożarna, Straż Miejska, GDDKiA, Pogotowie Ratunkowe) i publikuje publiczny Panel Frakcji.
5. `/setup-stats-panel` — tworzy kanały głosowe ze statystykami serwera (aktualizują się same co 10 minut).
6. `/sklep-admin dodaj nazwa:<...> cena:<...>` — dodaj pierwsze produkty do sklepu (domyślnie każdy tworzy nową rolę na Discordzie), potem `/setup-shop-panel` — publikuje panel sklepu.
7. `/config set-role key:<...>` i `/config set-channel key:<...>` — skonfiguruj role i kanały (użyj `/config view`, aby zobaczyć aktualny stan). Bez skonfigurowanej `role_admin`/`role_staff` komendy administracyjne działają dla każdego z natywnym uprawnieniem **Manage Server**. Skonfiguruj `rp_announce_channel_id`, aby `/rp start`/`/rp stop` miały gdzie wysyłać ogłoszenia.
8. Opcjonalnie ustaw `VERIFIED_ROBLOX_ROLE_ID` i `CITIZEN_LOG_CHANNEL_ID` w zmiennych środowiskowych (patrz niżej) — te dwa ustawienia świadomie żyją w env, nie w `/config`, żeby nie trzeba było ich ustawiać ponownie po każdym redeployu.

## Zmienne środowiskowe

| Zmienna | Opis |
|---|---|
| `DISCORD_TOKEN` | Token bota z Developer Portal |
| `CLIENT_ID` | ID aplikacji Discord |
| `GUILD_ID` | ID serwera deweloperskiego (rejestracja komend guild-scoped) |
| `DEPLOY_GLOBAL` | `true`/`false` — rejestracja komend globalnie zamiast na `GUILD_ID` |
| `DATABASE_PATH` | Ścieżka do pliku SQLite (lokalnie `./data/erlc.sqlite`) |
| `LOG_LEVEL` | `error` \| `warn` \| `info` \| `debug` |
| `VERIFIED_ROBLOX_ROLE_ID` | Rola nadawana automatycznie po weryfikacji konta Roblox (puste = brak) |
| `CITIZEN_LOG_CHANNEL_ID` | Kanał, na który trafiają utworzone dowody (puste = `/config` → panel obywatela) |
| `ARRIVALS_CHANNEL_ID` | Kanał „przyloty" — ogłoszenia dołączenia do serwera (puste = wyłączone) |
| `DEPARTURES_CHANNEL_ID` | Kanał „odloty" — ogłoszenia opuszczenia serwera (puste = wyłączone) |

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
  services/               # logika biznesowa (citizen, vehicle, ticket, faction, moderation, economy...)
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
| `/setup-roblox-panel` | Publikuje panel weryfikacji konta Roblox |
| `/setup-ticket-panel` | Publikuje panel ticketów |
| `/setup-faction-panel` | Zasiewa domyślne frakcje i publikuje Panel Frakcji |
| `/setup-stats-panel` | Tworzy samoaktualizujące się kanały statystyk |
| `/setup-shop-panel` | Publikuje panel sklepu |
| `/config set-channel / set-role / view` | Konfiguracja bota |
| `/mandat`, `/rekord`, `/moje-mandaty`, `/zaplac-mandat` | Mandaty i rejestr karny |
| `/warn`, `/mute`, `/unmute`, `/ban`, `/unban`, `/kick`, `/modlog` | Moderacja |
| `/rp start`, `/rp stop` | Ogłoszenie startu/końca sesji roleplay |
| `/frakcja create/delete/info/ranga/czlonek` | Zarządzanie frakcjami |
| `/frakcja-panel` | Panel zarządzania członkami frakcji |
| `/saldo`, `/nagroda-dzienna`, `/praca`, `/przelew`, `/ranking`, `/sklep` | Ekonomia |
| `/ekonomia dodaj/usun` | Zarządzanie saldem (staff) |
| `/sklep-admin dodaj/usun` | Zarządzanie katalogiem sklepu (admin) |
| `/ping`, `/help` | Ogólne |
