# CUPRA Competitor Workshop App – Umsetzungsplan

**Stand: 14.09.2026 · Phase 0 lokal umgesetzt und durchgeklickt (siehe README) · Basis: „Developer-Briefing: Workshop-App (Konzept-Umfang zur Aufwandsschätzung)“ vom 10.09.2026 (SAPERED)**
**Ziel dieses Plans: zuerst ein schneller, vorzeigbarer Prototyp, danach in klaren Stufen zur raumfähigen Version. Design/CI kommt vom Grafiker und ist eine eigene Phase.**
**Technische Referenz: `cupra.streak-challenge` (Next.js, Tailwind 4, Postgres über `pg`, Vitest, Vercel + Neon). Stack, Design-Tokens, Fonts und Infrastruktur-Bausteine werden übernommen.**

---

## 1. Leitprinzipien

1. **Prototyp vor Plattform.** Phase 0 liefert in etwa zwei Tagen einen klickbaren Prototyp aller Screens auf dem Handy, ohne Datenbank und ohne KI. Er dient dem Abgleich mit SAPERED und CUPRA, bevor Backend und Scoring gebaut werden.
2. **Regeln als reine Funktionen.** Punktevergabe (Argumente, Matrix), Session-Zustandsmaschine und Konfigurations-Validierung liegen framework-frei in `src/engine/` und sind per Vitest getestet. Die KI liefert nur Ja/Nein-Kriterien und Feedback-Text, die Punkte rechnet der Code. Damit ist „gleichartige Argumente bekommen dieselbe Punktzahl“ eine Eigenschaft des Codes, nicht des Modells.
3. **Eine Konfiguration, zwei Ansichten.** Personas, Kategorien, Differenzierungsliste, Matrix und Lösungsschlüssel stehen in einer JSON-Datei pro Markt. Teilnehmer-App und Trainer-Leinwand rendern dieselbe Quelle. Die Matrix existiert nirgends ein zweites Mal.
4. **Polling statt WebSocket.** Die Trainer-Steuerung ändert den Sessionzustand nur eine Handvoll Mal in 45 Minuten. Teilnehmer-Geräte fragen alle 2 Sekunden einen winzigen Zustands-Endpunkt ab. Das ist auf Vercel ohne Zusatzinfrastruktur robust, überlebt Reconnects trivial und liegt weit innerhalb der geforderten Sekunden-Latenz. Upgrade auf SSE bleibt möglich, die Client-Schnittstelle ändert sich dabei nicht.
5. **Server hält die Wahrheit.** Jedes abgesendete Argument und jede Matrix-Zuordnung wird sofort gespeichert. Ein Teilnehmer, der die Seite neu lädt, bekommt seinen Zustand vom Server zurück (US-1, Reconnect).
6. **Austauschbarer Scorer.** Es gibt ein `Scorer`-Interface mit zwei Implementierungen: `keywordScorer` (regelbasiert, deterministisch, läuft ohne API-Key) und `llmScorer` (Claude API). Der Prototyp läuft mit dem ersten, die Produktversion mit dem zweiten. Das ist gleichzeitig die im Briefing geforderte getrennte Schätzung „echtes LLM versus vereinfacht“.
7. **Konstanten zentral** in `src/engine/config.ts`.

---

## 2. Was aus der Streak Challenge übernommen wird

| Baustein | Quelle im Referenzprojekt | Übernahme |
|---|---|---|
| Projektgerüst | `package.json`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `postcss.config.mjs`, `next.config.ts` | 1:1 kopieren, Name anpassen |
| Design-Tokens und Fonts | `src/app/globals.css` (`@theme`, `@font-face`, Utilities `glass`, `bg-copper-gradient`, `bg-teal-tint`), `public/fonts/` | 1:1 kopieren |
| Hintergründe, Emblem, Icons | `public/design/`, `src/components/Background.tsx`, `src/components/Icon.tsx` | kopieren, Icons ergänzen |
| UI-Bausteine | `src/components/ui.tsx` (`PrimaryButton`, `SecondaryButton`, `Panel`, `StatTile`, `Overline`) | kopieren, erweitern (Textarea, Chip, Fortschrittsanzeige) |
| Leaderboard | `src/components/LeaderboardList.tsx` | anpassen: Punkte statt Streak, kein Ø-Wert |
| Datenbank-Setup | `docker-compose.yml`, `scripts/migrate.mts`, `src/lib/db.ts`, `.env.example` | kopieren, Container- und DB-Namen ändern (Port 5442) |
| Client-Infrastruktur | `src/lib/api.ts` (fetch-Wrapper mit `ApiError`), `src/lib/storage.ts` (abgesicherter localStorage) | kopieren, Keys anpassen (`cw.*`) |
| Deployment | `vercel.json` (Region `fra1`), README-Abschnitt Vercel + Neon | kopieren |
| Layout-Konvention | `max-w-[430px]`-Spalte, Safe-Area-Padding, `min-h-dvh` | für die Teilnehmer-App übernehmen |

Nicht übernehmbar ist das Layout der Trainer-Ansicht. Die Streak Challenge hat nur ein mobiles Layout, die Leinwand braucht ein breites Desktop-Layout (16:9, große Schrift, dunkler Grund, keine Interaktion außer der Steuerleiste).

---

## 3. Phasenplan

Nach jeder Phase existiert etwas Vorzeigbares. Aufwände sind grobe Orientierung für eine Person.

### Phase 0 – Klick-Prototyp (ca. 2 Tage) · Meilenstein „Prototyp“ · **umgesetzt 14.09.2026, Deployment offen**

Ziel: alle Screens des Teilnehmer-Flows und die Trainer-Leinwand mit Demo-Inhalt, im echten Look, auf dem eigenen Handy per Vercel-Link bedienbar. Keine Datenbank, keine KI, keine Geräte-Synchronisation. Der Prototyp beantwortet die Frage „ist das der richtige Flow?“ bevor Backend-Aufwand entsteht.

**Gerüst**
- [x] `create-next-app` (TypeScript, App Router, Tailwind, ESLint, `src/`), Bausteine aus Abschnitt 2 kopieren
- [x] `src/data/config/demo.json` mit Demo-Inhalt. **Seit 14.09.2026 mit dem SAPERED-Seed-Content** ([SAPERED_Workshop-App_SeedContent_CompI.md](SAPERED_Workshop-App_SeedContent_CompI.md)): Paula gegen Volvo EX30, Tom gegen Alfa Romeo Junior, je zwei Show-Kategorien, sieben erkundbare Differenzierer, fünf Tell-Fakten für den Trainer-Outro, Matrix mit der geschärften Achse „Brand stance“ von Established (inklusive Retro und Heritage) bis Challenger (zeitgenössisch), damit der CUPRA allein im Feld „Emotional · Challenger“ steht, acht Marken (drei im Raum). Fachlich Platzhalter, final von CUPRA
- [x] `src/engine/config.ts` (Konstanten, Abschnitt 9), `src/engine/types.ts`, `src/engine/configSchema.ts` (zod-Schema, validiert die JSON beim Import)
- [x] `src/engine/scoring.ts`: `pointsForArgument(evaluation)`, `pointsForMatrix(placements, solution, brands)`, `totalScore(...)` mit Unit-Tests
- [x] `src/engine/session.ts`: Zustandsmaschine (Abschnitt 4) als Reducer mit `NEXT`-Event, Unit-Test für die komplette Phasenfolge
- [x] `src/scoring/keywordScorer.ts`: Freitext gegen Need- und Differenzierungsliste matchen (normalisierte Stichwörter und Synonyme aus der Konfiguration), liefert `Evaluation` plus Feedback aus Textbausteinen

**Teilnehmer-Screens (`/s/demo`, ein Screen-Wechsel per State)**
- [x] **Join:** Anzeigename optional, Hinweis zur Teilnehmer-ID, Button „Beitreten“
- [x] **Lobby:** „Warte auf den Trainer“, Anzahl Teilnehmer (Demo: fest)
- [x] **Persona:** Name, Kurzbeschreibung, Needs als Liste, Hinweis auf den Wettbewerber dieser Runde
- [x] **Exploration:** Kategorien als aufklappbare Karten mit Prompts, keine Eingabe, dezenter Hinweis „Argumente formulierst du danach“
- [x] **Argumente:** Chat-artiger Verlauf. Textfeld unten, gesendetes Argument erscheint als Karte, darunter das Feedback (Platzhalter-Gestaltung), Zähler „Argument 1 von 3“, Button „Fertig“ ab dem ersten Argument. Nach dem dritten Argument oder „Fertig“: Gesamtfeedback mit Punkten dieser Runde
- [x] **Matrix:** Achsenbeschriftung, Positionen als Felder, Marken als Kacheln. Interaktion tippen-tippen (Marke wählen, dann Feld), kein Drag-and-drop, damit es auf jedem Handy zuverlässig geht. Absenden erst, wenn alle Marken platziert sind
- [x] **Warten auf Auflösung:** eigene Zuordnung sichtbar, „Der Trainer deckt gleich auf“
- [x] **Auflösung:** eigene Zuordnung gegen Lösung, richtig/falsch markiert, Punkte, CUPRA hervorgehoben
- [x] **Ergebnis:** eigener Gesamtstand, Leaderboard mit eigener Zeile hervorgehoben
- [x] Dev-Leiste (nur im Prototyp, per `?dev=1`): Phase vor und zurück, damit man den Flow allein durchklicken kann

**Trainer-Leinwand (`/t/demo`)**
- [x] Breites Layout mit Steuerleiste unten: aktuelle Phase, „Weiter“, „Zurück“, Teilnehmerzahl
- [x] Ansichten je Phase: Lobby mit großem QR-Platzhalter und Session-Code, Persona der Runde, Kategorien-Übersicht, Argument-Fortschritt (Demo: Balken), Matrix leer, Matrix aufgedeckt, Leaderboard
- [ ] Vercel-Deployment des Prototyps, Link an SAPERED

**Fertig wenn:** Jemand ohne Erklärung den Teilnehmer-Flow auf dem Handy durchklickt und die Trainer-Leinwand parallel im Laptop-Browser zeigt, was die Gruppe sehen würde. Feedback-Runde mit SAPERED vor Phase 1.

### Phase 1 – Raum-Prototyp: echte Sessions und Synchronisation (ca. 2 Tage)

Ziel: mehrere Handys treten per QR einer Session bei, der Trainer schaltet die Phasen weiter, alle Geräte folgen.

**Postgres**
- [ ] `docker-compose.yml`, `npm run db:up`, `npm run db:migrate`, Schema `db/migrations/0001_init.sql` (Abschnitt 6)
- [ ] Konfiguration wird beim Anlegen einer Session als JSON-Snapshot in `sessions.config` kopiert. Spätere Änderungen an der Datei wirken nur auf neue Sessions, laufende bleiben konsistent

**API (Abschnitt 7)**
- [ ] `POST /api/sessions` (Trainer legt Session an, bekommt 6-stelligen Code und Trainer-Token)
- [ ] `GET /api/sessions/[code]/state` (Phase, Runde, Version, Teilnehmerzahl), für Polling optimiert, `Cache-Control: no-store`
- [ ] `POST /api/sessions/[code]/advance` (Trainer-Token, `NEXT` oder `BACK`, Reducer aus `engine/session.ts`)
- [ ] `POST /api/sessions/[code]/join` (userId, Anzeigename, upsert `users` und `participations`)
- [ ] `GET /api/sessions/[code]/me?userId=` (eigener Stand: Argumente, Matrix, Punkte, für Reconnect)
- [ ] `GET /api/sessions/[code]/progress` (Trainer: wie viele haben Argument n abgeschickt, wie viele die Matrix)
- [ ] `GET /api/sessions/[code]/leaderboard`

**Client**
- [ ] `src/lib/identity.ts`: `userId` aus `?u=` der Join-URL, sonst aus localStorage, sonst neu erzeugen. Die Herkunft der ID ist gekapselt, damit die noch offene übergreifende Mechanik (vorab vergebene Codes, Badge-Scan) später ohne Umbau eingehängt werden kann
- [ ] `useSessionState(code)`: Polling alle 2 s, bei Fehler Backoff bis 10 s, sichtbarer Hinweis „Verbindung wird wiederhergestellt“
- [ ] Teilnehmer-App liest die Phase vom Server statt aus der Dev-Leiste; Dev-Leiste bleibt hinter `?dev=1` für lokale Tests
- [ ] Trainer-Seiten `/t` (Session anlegen) und `/t/[code]` (Steuerung), Trainer-Token in localStorage
- [ ] QR-Code für die Join-URL (`qrcode`-Paket, SVG, groß auf der Leinwand)

**Fertig wenn:** Drei Handys über Mobilfunk plus ein Laptop. Trainer drückt „Weiter“, alle Handys wechseln innerhalb von 2 bis 3 Sekunden. Handy neu laden führt in dieselbe Phase unter derselben ID zurück.

### Phase 2 – KI-Scoring und dialogisches Feedback (ca. 1,5 Tage)

Ziel: Argumente werden von Claude gegen das Raster aus Briefing Abschnitt 7 bewertet, Feedback in wenigen Sekunden.

- [ ] `POST /api/sessions/[code]/arguments`: speichert das Argument sofort (Status `pending`), ruft den Scorer, speichert `evaluation`, `feedback`, `points`, antwortet mit dem Ergebnis. Ein Argument pro Runde und Index, doppeltes Absenden wird abgewiesen (C3)
- [ ] `src/scoring/llmScorer.ts` mit dem Anthropic TypeScript SDK und Structured Outputs: Ausgabeschema `{ addressesNeed: boolean, needId: string | null, namesDifferentiator: boolean, differentiatorId: string | null, isKeyDifferentiator: boolean, feedback: string }`. Punkte berechnet `engine/scoring.ts` aus den Booleans. Modell `claude-opus-5` mit `effort: "low"` für kurze Antwortzeit; Modellwahl ist bewusst eine Konstante, Wechsel auf ein günstigeres Modell ist eine Entscheidung des Auftraggebers und im Code ein Einzeiler
- [ ] System-Prompt ist statisch, Persona, Wettbewerber und Differenzierungsliste der Runde kommen als erster User-Block mit `cache_control`. Bei 24 Teilnehmern mal 3 Argumenten wird derselbe Kontext 72-mal gelesen, das lohnt sich für Latenz und Kosten
- [ ] Prompt-Regeln: bewertet wird die Brücke Feature zu Need, nicht Stil oder Länge. Feedback ein bis zwei Sätze, ermutigend, benennt worauf es ankommt, verrät keine Listeneinträge wörtlich (sonst Raten)
- [ ] Gesamtfeedback nach der Runde: ein zweiter Aufruf mit allen drei Argumenten und Bewertungen, Ausgabe zwei bis drei Sätze plus Punktestand. Ohne LLM: Textbaustein nach Punktestufen
- [ ] Fehlerpfad: Timeout nach 12 s oder API-Fehler, dann `keywordScorer` als Fallback, Feedback bekommt den Zusatz „(automatisch bewertet)“. Das Argument geht nie verloren, die Punkte liegen immer vor dem Outro vor (US-6)
- [ ] Kleiner Eval-Satz: 20 bis 30 Beispiel-Argumente mit erwarteter Bewertung in `src/scoring/__tests__/fixtures.json`, Skript `npm run eval:scoring` gibt Trefferquote aus. Ist die Grundlage für die Abnahme des Rasters mit CUPRA, sobald die echte Liste da ist
- [ ] Umschalter per Umgebungsvariable `SCORER=llm|keyword`

**Fertig wenn:** Ein Argument wird im Handy abgeschickt, das Feedback erscheint nach 2 bis 5 Sekunden, gleiche Argumente bekommen gleiche Punkte, der Fallback greift bei gezogenem API-Key.

### Phase 3 – Matrix, Leaderboard, Robustheit (ca. 1,5 Tage)

- [ ] `POST /api/sessions/[code]/matrix`: alle Zuordnungen auf einmal, serverseitig gegen den Schlüssel bewertet, doppelte Punkte für CUPRA, zweites Absenden abgewiesen
- [ ] Trainer-Leinwand Matrix: Phase `matrix` zeigt die leere Matrix plus Abgabe-Zähler „18 von 24 haben abgegeben“, Phase `reveal` deckt die komplette Lösung auf einmal auf (D4). Optional als Zusatzinformation die Verteilung der Gruppe pro Feld (kleine Zahl), macht die Abweichung Vermutung zu Wahrheit sichtbar
- [ ] Leaderboard serverseitig als SQL-View über `participations.score`, Tie-Break frühere Abgabe. Trainer-Leinwand zeigt Top 10 groß, Teilnehmer-App Top 10 plus eigene Zeile
- [ ] Phasenwechsel schließt offene Eingaben: wer beim Wechsel zu `matrix` noch tippt, sieht den Hinweis „Der Trainer ist weitergegangen“ und die bisherigen Punkte bleiben. Argumente, die während des Wechsels unterwegs sind, werden noch angenommen (Toleranz 10 s)
- [ ] Reconnect Ende-zu-Ende testen: Flugmodus während Argument-Eingabe, Tab-Wechsel, Browser-Neustart
- [ ] Doppel-Tap, leere Eingaben, Länge begrenzen (`ARGUMENT_MAX_CHARS`)
- [ ] Trainer-Notfallfunktionen: Session zurücksetzen, Teilnehmer entfernen, „Zurück“ eine Phase

**Fertig wenn:** Ein kompletter Workshop mit 5 Geräten läuft durch, inklusive Leaderboard auf der Leinwand. Damit ist der Kern-Umfang aus Briefing Abschnitt 9 abgedeckt.

### Phase 4 – Konfiguration, Deployment, Raumtest (ca. 1,5 Tage) · Meilenstein „Raumfähig“

- [ ] **Konfigurations-Template (einfache Variante, Briefing US-10):** Excel-Vorlage mit einem Blatt je Bereich (Personas, Kategorien, Differenzierer, Needs, Marken, Matrix). `npm run config:import -- markt.xlsx` erzeugt und validiert die JSON, `npm run config:export` erzeugt die Vorlage aus der Demo-JSON. Fehler werden mit Blatt und Zeile ausgegeben. Der Fachanwender füllt Excel, der Entwickler importiert. Kein Code-Editieren durch den Fachanwender
- [ ] Session-Anlage wählt die Konfiguration (Dropdown aller `src/data/config/*.json`)
- [ ] Vercel-Projekt, Neon-Postgres, `DATABASE_URL` und `ANTHROPIC_API_KEY` als Umgebungsvariablen, Migration gegen Produktion
- [ ] Trainer-Route mit einfachem Schutz (Umgebungsvariable `TRAINER_PIN`, Eingabe einmal pro Browser), damit kein Teilnehmer versehentlich die Leinwand steuert
- [ ] Lasttest: Skript simuliert 24 Teilnehmer, die innerhalb von 60 s je 3 Argumente absenden (72 LLM-Aufrufe parallel), Antwortzeiten protokollieren
- [ ] Raumtest mit echten Geräten über Mobilfunk und WLAN, Checkliste für den Trainer (Session anlegen, QR zeigen, Phasen, Notfall)
- [ ] README mit Betrieb, Konfiguration, Trainer-Anleitung

**Fertig wenn:** Eine Trainingsgruppe kann den Workshop mit echter Konfiguration durchführen.

### Phase 5 – Design/CI (Aufwand nach Vorlage des Grafikers, Erfahrungswert Streak Challenge: ca. 2 bis 3 Tage)

- [ ] Screens nach Figma umsetzen, insbesondere Feedback-Element, Matrix-Darstellung und Trainer-Leinwand (Briefing Abschnitt 11)
- [ ] Visueller Abgleich per Playwright-Screenshots wie im Referenzprojekt
- [ ] Animationen: Feedback erscheint, Matrix-Auflösung, Leaderboard-Aufbau

### Spätere Optionen (nicht im Kern-Umfang, getrennt schätzbar)

| Option | Aufwand | Anmerkung |
|---|---|---|
| Komfortables Admin-UI statt Excel-Import | 4 bis 6 Tage | Formulare für alle Konfigurationsbereiche, Vorschau der Matrix, Versionierung. Nur sinnvoll, wenn viele Märkte häufig ändern |
| SSE statt Polling | 1 Tag | Ein Endpunkt `/api/sessions/[code]/events`, Client-Hook tauschbar. Erst bei Bedarf |
| Übergreifende Identitätsmechanik | 1 bis 2 Tage | Wenn die Reihe entschieden hat (Codes, Badge), Anbindung in `identity.ts`, ggf. Import einer Teilnehmerliste |
| Workshop-übergreifende Aggregation | 1 Tag | `participations` trägt bereits `workshop_ref`, eine Abfrage plus Ansicht |
| Mehrsprachigkeit | 1,5 Tage | i18n-Aufbau aus der Streak Challenge übernehmen, Konfiguration pro Sprache |
| Competitor II (emotional) | eigenes Konzept | nicht schätzen |

---

## 4. Session-Zustandsmaschine (`src/engine/session.ts`)

```
lobby
  → persona   (round 0)
  → explore   (round 0)
  → argue     (round 0)
  → persona   (round 1)
  → explore   (round 1)
  → argue     (round 1)
  → matrix
  → reveal
  → leaderboard
  → ended
```

Zustand: `{ phase, round, version }`. Jeder Trainer-Klick erhöht `version`; die Teilnehmer-App rendert neu, wenn sich `version` ändert. Die Anzahl Runden kommt aus der Konfiguration (`rounds.length`), der Reducer ist dafür generisch. `BACK` geht eine Phase zurück, löscht aber keine Daten.

Teilnehmer-Zustand ist davon getrennt und pro Person: `argumentsSubmitted[round]`, `roundFinished[round]`, `matrixSubmitted`. Er lebt auf dem Server und wird beim Laden per `/me` geholt.

---

## 5. Projektstruktur

```
src/
  app/
    page.tsx                         Einstieg: Code eingeben (Fallback ohne QR)
    s/[code]/page.tsx                Teilnehmer-App (State-Wechsel, kein Routing im Flow)
    t/page.tsx                       Trainer: Session anlegen
    t/[code]/page.tsx                Trainer: Leinwand + Steuerleiste
    api/sessions/route.ts
    api/sessions/[code]/state/route.ts
    api/sessions/[code]/advance/route.ts
    api/sessions/[code]/join/route.ts
    api/sessions/[code]/me/route.ts
    api/sessions/[code]/arguments/route.ts
    api/sessions/[code]/matrix/route.ts
    api/sessions/[code]/progress/route.ts
    api/sessions/[code]/leaderboard/route.ts
  components/
    participant/   JoinScreen, LobbyScreen, PersonaScreen, ExploreScreen,
                   ArgueScreen, ArgumentCard, FeedbackCard, MatrixScreen,
                   RevealScreen, ResultScreen, DevBar
    trainer/       TrainerShell, ControlBar, LobbyView (QR), PersonaView,
                   ExploreView, ArgueProgressView, MatrixView, LeaderboardView
    shared/        Matrix (eine Komponente, zwei Größen), LeaderboardList,
                   Background, Icon, ui
  engine/          reine Funktionen: config, types, configSchema, session, scoring
  scoring/         Scorer-Interface, keywordScorer, llmScorer, prompts, __tests__
  data/config/     demo.json, später ein JSON pro Markt
  lib/             db, api, storage, identity, useSessionState
db/migrations/
scripts/           migrate.mts, config-import.mts, config-export.mts, simulate.mts
```

---

## 6. Datenmodell (SQL, `db/migrations/0001_init.sql`)

```sql
create extension if not exists pgcrypto;

create table users (
  id            text primary key,                 -- persistente, workshopübergreifende User-ID
  display_name  text check (char_length(display_name) <= 20),
  created_at    timestamptz not null default now()
);

create table sessions (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,             -- 6 Zeichen, für QR und Eingabe
  workshop_ref  text not null,                    -- z. B. 'competitor-1'
  config_ref    text not null,                    -- Name der Konfigurationsdatei
  config        jsonb not null,                   -- Snapshot der Konfiguration
  phase         text not null default 'lobby',
  round         int  not null default 0,
  version       int  not null default 0,
  trainer_token uuid not null default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table participations (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references sessions(id) on delete cascade,
  user_id       text not null references users(id),
  workshop_ref  text not null,
  score         int  not null default 0,
  joined_at     timestamptz not null default now(),
  unique (session_id, user_id)
);

create table argument_submissions (
  id               uuid primary key default gen_random_uuid(),
  participation_id uuid not null references participations(id) on delete cascade,
  round            int  not null,
  idx              int  not null,                 -- 0..2
  text             text not null,
  status           text not null default 'pending', -- pending | scored | fallback
  evaluation       jsonb,                         -- Kriterien-Booleans + IDs
  feedback         text,
  points           int  not null default 0,
  scorer           text,                          -- 'llm' | 'keyword'
  latency_ms       int,
  created_at       timestamptz not null default now(),
  unique (participation_id, round, idx)
);

create table matrix_placements (
  id               uuid primary key default gen_random_uuid(),
  participation_id uuid not null references participations(id) on delete cascade,
  brand_id         text not null,
  position_id      text not null,
  correct          boolean not null,
  points           int  not null,
  created_at       timestamptz not null default now(),
  unique (participation_id, brand_id)
);

create view leaderboard as
select
  row_number() over (partition by p.session_id order by p.score desc, p.joined_at asc)::int as rank,
  p.session_id, p.user_id, u.display_name, p.score
from participations p join users u on u.id = p.user_id;
```

`participations.score` wird bei jeder bepunkteten Abgabe in derselben Transaktion nachgeführt, damit Leaderboard und Trainer-Fortschritt ohne Aggregation lesbar sind. Die Datenbank ist nur über die API-Routen erreichbar, kein Row-Level-Security nötig.

---

## 7. API-Verträge (Kurzform)

| Endpunkt | Wer | Request | Antwort |
|---|---|---|---|
| `POST /api/sessions` | Trainer | `{ configRef }` | `{ code, trainerToken }` |
| `GET /api/sessions/[code]/state` | alle | – | `{ phase, round, version, participants, roundsTotal }` |
| `POST /api/sessions/[code]/advance` | Trainer | `{ trainerToken, action: "NEXT" \| "BACK" }` | neuer `state` |
| `POST /api/sessions/[code]/join` | Teilnehmer | `{ userId, displayName? }` | `{ participationId, state, me }` |
| `GET /api/sessions/[code]/me?userId=` | Teilnehmer | – | `{ arguments[], matrix[], score, roundFinished[] }` |
| `POST /api/sessions/[code]/arguments` | Teilnehmer | `{ userId, round, idx, text }` | `{ evaluation, feedback, points, score }` · 409 wenn bereits gesetzt |
| `POST /api/sessions/[code]/rounds/[round]/finish` | Teilnehmer | `{ userId }` | `{ summary, roundPoints, score }` |
| `POST /api/sessions/[code]/matrix` | Teilnehmer | `{ userId, placements: [{ brandId, positionId }] }` | `{ results[], points, score }` · 409 wenn bereits gesetzt |
| `GET /api/sessions/[code]/progress` | Trainer | – | `{ participants, argumentsByRound[], matrixSubmitted, matrixDistribution }` |
| `GET /api/sessions/[code]/leaderboard?userId=` | alle | – | `{ top[], me }` |

Validierung mit `zod`, Phasenprüfung serverseitig (Argument nur in `argue` der passenden Runde, Matrix nur in `matrix`, jeweils mit 10 s Toleranz nach Phasenwechsel).

---

## 8. Konfigurationsformat (`src/data/config/*.json`)

```jsonc
{
  "id": "demo",
  "market": "DE",
  "workshopRef": "competitor-1",
  "language": "en",
  "brands": [
    { "id": "cupra", "name": "CUPRA Delta", "isCupra": true, "present": true },
    { "id": "comp-a", "name": "Wettbewerber A", "present": true },
    { "id": "comp-b", "name": "Wettbewerber B", "present": true },
    { "id": "comp-c", "name": "Wettbewerber C", "present": false }
  ],
  "needs": [
    { "id": "n-range", "text": "Alltagstaugliche Reichweite ohne Ladestress", "keywords": ["Reichweite", "laden", "km"] }
  ],
  "differentiators": [
    {
      "id": "d-charge",
      "text": "Schnellladen 10–80 % in unter 30 Minuten",
      "vsBrandIds": ["comp-a", "comp-b"],
      "needIds": ["n-range"],
      "key": true,
      "keywords": ["Schnellladen", "Ladezeit", "30 Minuten"]
    }
  ],
  "rounds": [
    {
      "id": "r1",
      "competitorBrandId": "comp-a",
      "persona": {
        "name": "Lena, 34, urban",
        "description": "…",
        "needIds": ["n-range", "n-design"]
      },
      "categories": [
        { "id": "c-exterior", "title": "Exterieur", "prompts": ["Vergleiche die Frontpartie…", "…"] }
      ]
    }
  ],
  "matrix": {
    "axes": {
      "x": { "label": "Charakter", "low": "rational", "high": "emotional" },
      "y": { "label": "Preis", "low": "günstig", "high": "premium" }
    },
    "positions": [
      { "id": "p-tl", "label": "rational · premium", "x": 0, "y": 1 },
      { "id": "p-tr", "label": "emotional · premium", "x": 1, "y": 1 },
      { "id": "p-bl", "label": "rational · günstig", "x": 0, "y": 0 },
      { "id": "p-br", "label": "emotional · günstig", "x": 1, "y": 0 }
    ],
    "solution": { "cupra": "p-tr", "comp-a": "p-bl", "comp-b": "p-br", "comp-c": "p-tl" }
  }
}
```

`keywords` nutzt nur der `keywordScorer`; der `llmScorer` bekommt `text`, `needIds` und `vsBrandIds`. Differenzierer tragen ein `tag`: `show` ist am stehenden Auto erkundbar und zählt im Scoring, `tell` (Reichweite, Preis, Ladezeit) zählt nicht und erscheint als `outro.facts` auf der Leinwand beim Leaderboard, als Stichworte für das Schlusswort des Trainers. Das zod-Schema prüft Referenzen (jede `needId`, `brandId`, `positionId` existiert, jede Marke hat eine Lösung, jede Runde hat mindestens eine Kategorie). Die Demo-Inhalte sind fachliche Platzhalter, die echten Listen kommen von CUPRA (Briefing Abschnitt 11).

Die Matrix ist bewusst als Liste von Positionen mit Koordinaten modelliert statt als festes 2x2. Damit sind 2x2, 3x3 oder ein Raster mit Zwischenstufen dieselbe Komponente.

---

## 9. Konstanten (`src/engine/config.ts`)

| Konstante | Wert | Quelle |
|---|---|---|
| `ARGUMENTS_PER_ROUND` | 3 | C1 |
| `ARGUMENT_MAX_CHARS` | 400 | Annahme |
| `POINTS_NEED` | 1 | Kriterium 1 |
| `POINTS_DIFFERENTIATOR` | 1 | Kriterium 2 |
| `POINTS_KEY_BONUS` | 1 | Bonus |
| `POINTS_MATRIX_CORRECT` | 1 | D3 |
| `MATRIX_CUPRA_MULTIPLIER` | 2 | D3 |
| `STATE_POLL_MS` | 2 000 | NFR Realtime |
| `PROGRESS_POLL_MS` | 3 000 | Trainer |
| `PHASE_GRACE_MS` | 10 000 | Toleranz nach Phasenwechsel |
| `SCORER_TIMEOUT_MS` | 12 000 | Fallback-Schwelle |
| `DISPLAY_NAME_MAX` | 20 | A3 |
| `LEADERBOARD_TOP_N` | 10 | E1 |
| `SESSION_CODE_LENGTH` | 6 | A2 |

Maximal 3 Punkte pro Argument, 9 pro Runde, 18 aus zwei Runden, plus Matrix (bei 6 Marken: 5 plus 2 für CUPRA, also 7). Gesamt maximal 25. Die Punktwerte sind Konfiguration, kein Umbau nötig, falls CUPRA anders gewichten will.

---

## 10. Schätz-Hebel (Briefing Abschnitt 9, getrennt ausgewiesen)

| Hebel | Variante A (einfach) | Variante B (voll) | Differenz |
|---|---|---|---|
| Scoring und Feedback | `keywordScorer`: Stichwort-Abgleich, Textbaustein-Feedback. Ca. 0,5 Tag (in Phase 0 enthalten). Schwäche: Synonyme, Umschreibungen, Tippfehler erkennt es nur, wenn gepflegt. Feedback wirkt generisch | `llmScorer` mit Claude, Structured Outputs, Prompt-Caching, Fallback, Eval-Satz. Ca. 1,5 Tage (Phase 2) plus laufende API-Kosten im Cent-Bereich pro Workshop | ca. 1 Tag plus Betriebskosten |
| Realtime | Polling alle 2 s. 0 Tage Zusatzaufwand, keine Infrastruktur | SSE-Endpunkt, Push unter 1 s. Ca. 1 Tag, auf Vercel mit Function-Laufzeit-Limit zu beachten | ca. 1 Tag, für 45-Minuten-Workshops nicht nötig |
| Konfiguration | Excel-Template mit Import-Skript und Validierung. Ca. 1 Tag (Phase 4) | Admin-UI mit Formularen, Matrix-Vorschau, Versionierung. Ca. 4 bis 6 Tage | ca. 3 bis 5 Tage |
| Screens | Teilnehmer 9 Screens, Trainer 7 Ansichten, ungestylt mit Tokens der Streak Challenge. In Phasen 0 bis 3 enthalten | Nach Figma des Grafikers, mit Animationen. Ca. 2 bis 3 Tage (Phase 5) | Design-Phase |

**Summe Kern-Umfang (Phasen 0 bis 4, Variante A bei Realtime und Konfiguration, Variante B beim Scoring): ca. 8,5 Tage.** Design/CI kommt obendrauf, sobald das Figma vorliegt.

---

## 11. Risiken und getroffene Entscheidungen

1. **Ground Truth fehlt noch.** Ohne Differenzierungs- und Need-Liste von CUPRA ist jedes Scoring Platzhalter. Deshalb Eval-Satz und Excel-Template früh, damit CUPRA die Listen direkt in der Zielstruktur liefert und die Trefferquote messbar wird.
2. **LLM-Latenz bei 72 Aufrufen in einer Minute.** Prompt-Caching, `effort: "low"`, kurze Ausgabe und der Fallback-Scorer halten die Wartezeit in Grenzen. Der Lasttest in Phase 4 misst das. Rate-Limits des API-Kontos vorab prüfen.
3. **Polling auf Vercel.** 25 Geräte alle 2 s sind rund 750 Requests pro Minute auf eine Route, die eine Zeile liest. Unkritisch, aber im Vercel-Kontingent mitdenken. Bei mehreren parallelen Räumen steigt es linear.
4. **Identitätsmechanik ist offen.** `identity.ts` kapselt die Herkunft der ID (URL-Parameter, localStorage, später Codes oder Badge). Solange die Reihe nicht entschieden hat, ist die ID gerätegebunden wie in der Streak Challenge.
5. **Tippen-tippen statt Drag-and-drop in der Matrix.** Robuster auf Smartphones, schneller gebaut, für den Grafiker leichter zu gestalten. Drag-and-drop bleibt eine Design-Option in Phase 5.
6. **Konfigurations-Snapshot pro Session.** Eine laufende Session ändert sich nicht, auch wenn die JSON angepasst wird. Kostet eine `jsonb`-Spalte, spart Inkonsistenzen.
7. **Trainer-Schutz nur per PIN.** Authentifizierung ist laut Briefing nicht im Umfang. Die PIN verhindert Versehen, nicht Angriffe.
8. **Modellwahl.** Der Plan setzt `claude-opus-5` als Konstante. Ein günstigeres Modell ist eine bewusste Entscheidung des Auftraggebers und im Code ein Einzeiler, der Eval-Satz zeigt dann sofort, ob die Qualität hält.

---

## 11a. Offene Design-Entscheidungen aus dem Feedback (14.09.2026)

**Weniger Trainer-Klicks im Runden-Ablauf.** Der separate Schritt „Send to the cars“ (Phase `explore`) soll entfallen. Teilnehmer lesen die Persona und legen direkt los. Optional entscheiden sie selbst, wann sie zur Argument-Eingabe wechseln, der Trainer gibt nur noch Runde 2 und am Ende die Matrix frei. Details werden später festgelegt.

Was das technisch bedeutet, falls es so kommt:

- Die Phasenfolge pro Runde schrumpft von `persona → explore → argue` auf eine Phase `round`, in der Persona, Kategorien und Argument-Eingabe auf einem Screen liegen (Persona oben, Kategorien aufklappbar, Eingabe darunter oder per Tab). Trainer-Klicks pro Workshop: Start, Runde 2, Matrix, Auflösung, Leaderboard.
- Der Teilnehmer-Fortschritt innerhalb der Runde (liest, erkundet, gibt ein) wird zum Teilnehmer-Zustand, nicht zum Session-Zustand. Der Trainer sieht ihn auf der Leinwand als Verteilung („14 erkunden, 8 tippen, 2 fertig“).
- Reducer und Konfiguration sind dafür bereits generisch genug, die Änderung liegt in `phaseSequence` und in einem zusammengelegten Screen. Aufwand im Prototyp ca. 0,5 Tag.
- Gegenläufiger Effekt: Ohne getaktete Erkundung tippen die Schnellen früh, während die Langsamen noch am Auto stehen. Das Briefing wollte die App in der Erkundung bewusst passiv halten (B3). Mit SAPERED klären, ob das gewollt ist oder ob eine Mindest-Erkundungszeit (Eingabe erst nach n Minuten frei) sinnvoll ist.

---

## 12. Nächster Schritt

Phase 0 starten: Projekt aufsetzen, Bausteine aus der Streak Challenge kopieren, Demo-Konfiguration schreiben, Engine mit Tests, dann die Screens. Ziel ist ein Vercel-Link für SAPERED nach etwa zwei Tagen. Die Feedback-Runde zu Flow und Screens entscheidet, ob Phase 1 unverändert startet.
