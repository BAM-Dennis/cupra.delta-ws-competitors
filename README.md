# CUPRA Competitor Workshop App

Workshop-App für das CUPRA Global Launch Training, Workshop „Competitor I“. Teilnehmer erkunden per Smartphone die Fahrzeuge, formulieren Verkaufsargumente gegen den Wettbewerb, bekommen Coaching-Feedback und Punkte, ordnen die Marken in der Positionierungs-Matrix zu. Der Trainer steuert die Session und präsentiert Matrix und Leaderboard auf der Leinwand.

Konzept: [SAPERED_Workshop-App_Konzept_Aufwandsschaetzung.md](SAPERED_Workshop-App_Konzept_Aufwandsschaetzung.md) · Plan: [umsetzungsplan.md](umsetzungsplan.md)

## Stand: Phase 0, Klick-Prototyp

Alle Screens des Teilnehmer-Flows und die Trainer-Leinwand mit Demo-Inhalt, im Look der CUPRA Streak Challenge. **Ohne Datenbank, ohne KI, ohne Geräte-Synchronisation.** Session und Teilnehmer liegen im `localStorage` des Browsers.

- Trainer-Tab und Teilnehmer-Tab **im selben Browser** sind synchron: der Trainer klickt „Weiter“, der Teilnehmer-Tab folgt.
- Auf einem anderen Gerät läuft der Teilnehmer-Flow unabhängig, mit `?dev=1` erscheint eine Leiste zum Durchklicken der Phasen.
- Scoring läuft über den regelbasierten `keywordScorer` (Stichwörter aus der Konfiguration), mit simulierter Antwortzeit.
- Mitspieler im Leaderboard und Fortschrittszahlen auf der Leinwand sind Demo-Daten.

Phase 1 ersetzt den localStorage durch Postgres plus Polling, Phase 2 den Keyword-Scorer durch Claude. Die Screens bleiben.

## Stack

Next.js (App Router, TypeScript), Tailwind 4, Vitest. Ab Phase 1: Postgres über `pg`. Ab Phase 2: Anthropic SDK.

## Lokal starten

```bash
npm install
npm run dev          # http://localhost:3000
```

| Route | Zweck |
|---|---|
| `/` | Einstieg: Session-Code eingeben, Demo-Links |
| `/s/demo` | Teilnehmer-App (Session „demo“) |
| `/s/demo?dev=1` | Teilnehmer-App mit Dev-Leiste zum Phasenwechsel |
| `/t/demo` | Trainer-Leinwand mit Steuerleiste und QR-Code |

Demo zurücksetzen: „Reset“ in der Trainer-Steuerleiste oder das Reset-Symbol in der Dev-Leiste.

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run dev` | Dev-Server |
| `npm test` | Unit-Tests für Engine und Scorer (Vitest) |
| `npm run lint` | ESLint |
| `npm run build` | Produktions-Build |

## Struktur

- `src/engine/` – reine Funktionen: Konstanten (`config.ts`), Typen, zod-Schema der Konfiguration, Punktevergabe (`scoring.ts`), Session-Zustandsmaschine (`session.ts`).
- `src/scoring/` – `Scorer`-Interface und `keywordScorer`. Der `llmScorer` (Phase 2) implementiert dasselbe Interface.
- `src/data/config/demo.json` – Demo-Konfiguration: Marken, Needs, Differenzierer, zwei Runden mit Persona und Kategorien, Matrix mit Lösungsschlüssel. **Fachliche Platzhalter**, die echten Listen kommen von CUPRA.
- `src/components/participant/` – Teilnehmer-Screens, `ParticipantApp.tsx` schaltet nach Phase.
- `src/components/trainer/` – Leinwand: `TrainerApp.tsx` (Kopf, Steuerleiste, Phasen-Stepper) und `views.tsx`.
- `src/components/shared/` – `Matrix.tsx` (eine Komponente für App und Leinwand), Leaderboard, UI-Bausteine, Hintergründe und Icons aus der Streak Challenge.
- `src/lib/` – `useLocalSession` (Phase-0-Ersatz für den Server), `storedValue` (localStorage mit Tab-Sync), `identity` (persistente Teilnehmer-ID), `demoData`.
- `src/app/globals.css` – Cupra-Fonts und Design-Tokens, übernommen aus der Streak Challenge.

## Konfiguration anpassen

`src/data/config/demo.json` editieren. Das zod-Schema prüft beim Start Referenzen (Needs, Marken, Positionen, Lösung je Marke, genau eine CUPRA-Marke). `keywords` an Needs und Differenzierern nutzt nur der Keyword-Scorer. Neue Konfiguration: Datei anlegen und in `src/data/config/index.ts` registrieren.

## Punkte

Pro Argument: 1 Punkt Need getroffen, 1 Punkt CUPRA-Differenzierer gegen diesen Wettbewerber, 1 Bonus für einen als entscheidend markierten Differenzierer. Drei Argumente pro Runde, zwei Runden. Matrix: 1 Punkt pro richtig platzierter Marke, CUPRA doppelt. Werte in `src/engine/config.ts`.
