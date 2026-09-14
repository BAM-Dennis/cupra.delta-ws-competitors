# CUPRA Competitor Workshop App

Workshop-App für das CUPRA Global Launch Training, eine Plattform für zwei Workshop-Typen:

- **Competitor I (rational):** Teilnehmer erkunden per Smartphone die Fahrzeuge, formulieren Verkaufsargumente gegen den Wettbewerb, bekommen Coaching-Feedback und Punkte, ordnen die Marken in der Positionierungs-Matrix zu.
- **Competitor II (emotional):** Teilnehmer interviewen eine Persona mit offenen Fragen, decken ihre Kaufmotive auf, finden am Fahrzeug die CUPRA-Features, die auf diese Motive einzahlen. Die Leinwand zeigt am Ende, welche Features die Gruppe welchem Motiv zugeordnet hat.

Der Trainer steuert die Session und präsentiert auf der Leinwand.

Konzepte: [Competitor I](SAPERED_Workshop-App_Konzept_Aufwandsschaetzung.md) · [Competitor II](SAPERED_Workshop-App_Konzept_Aufwandsschaetzung_CompII.md) · Plan: [umsetzungsplan.md](umsetzungsplan.md)

## Stand: Phase 0, Klick-Prototyp

Alle Screens beider Teilnehmer-Flows und die Trainer-Leinwand mit Demo-Inhalt, im Look der CUPRA Streak Challenge. **Ohne Datenbank, ohne KI, ohne Geräte-Synchronisation.** Session und Teilnehmer liegen im `localStorage` des Browsers.

- Trainer-Tab und Teilnehmer-Tab **im selben Browser** sind synchron: der Trainer klickt „Weiter“, der Teilnehmer-Tab folgt.
- Auf einem anderen Gerät läuft der Teilnehmer-Flow unabhängig, mit `?dev=1` erscheint eine Leiste zum Durchklicken der Phasen.
- Scoring läuft über den regelbasierten `keywordScorer` (Stichwörter aus der Konfiguration), mit simulierter Antwortzeit. Für Comp II heißt das: die Persona antwortet mit festen Aufdeck- und Stups-Sätzen, die Fragewort-Heuristik entscheidet über offen/geschlossen.
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
| `/s/demo` | Teilnehmer-App Competitor I (Session „demo“) |
| `/s/demo?dev=1` | dito mit Dev-Leiste zum Phasenwechsel |
| `/t/demo` | Trainer-Leinwand Competitor I |
| `/s/demo2`, `/s/demo2?dev=1` | Teilnehmer-App Competitor II |
| `/t/demo2` | Trainer-Leinwand Competitor II |

Demo zurücksetzen: „Reset“ in der Trainer-Steuerleiste oder das Reset-Symbol in der Dev-Leiste.

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run dev` | Dev-Server |
| `npm test` | Unit-Tests für Engine und Scorer (Vitest) |
| `npm run lint` | ESLint |
| `npm run build` | Produktions-Build |

## Struktur

- `src/engine/` – reine Funktionen: Konstanten (`config.ts`), Typen für beide Workshop-Typen, zod-Schema der Konfiguration (diskriminierte Union über `type`), Punktevergabe und Motiv-Clustering (`scoring.ts`), Session-Zustandsmaschine mit Phasenfolge je Typ (`session.ts`).
- `src/scoring/` – `Scorer`-Interface (Comp I: Argument, Rundenfeedback; Comp II: Interview, Feature, Rundenfeedback) und `keywordScorer`. Der `llmScorer` (Phase 2) implementiert dasselbe Interface.
- `src/data/config/demo.json` – Demo-Konfiguration Comp I: Marken, Needs, Differenzierer, zwei Runden mit Persona und Kategorien, Matrix mit Lösungsschlüssel.
- `src/data/config/demo2.json` – Demo-Konfiguration Comp II: Marken, vier Motive, sieben Features mit Motiv-Zuordnung (many-to-many), zwei Interview-Personas mit Motiv-Themen, Aufdeck-Sätzen und Stups-Texten. Beide Dateien sind **fachliche Platzhalter**, die echten Inhalte kommen von CUPRA.
- `src/components/participant/` – Teilnehmer-Screens, `ParticipantApp.tsx` schaltet nach Phase und Workshop-Typ. Comp-II-Screens in `Comp2Screens.tsx`.
- `src/components/trainer/` – Leinwand: `TrainerApp.tsx` (Kopf, Steuerleiste, Phasen-Stepper), `views.tsx` (Comp I und gemeinsam), `views2.tsx` (Comp II).
- `src/components/shared/` – `Matrix.tsx` (eine Komponente für App und Leinwand), Leaderboard, UI-Bausteine, Hintergründe und Icons aus der Streak Challenge.
- `src/lib/` – `useLocalSession` (Phase-0-Ersatz für den Server), `storedValue` (localStorage mit Tab-Sync), `identity` (persistente Teilnehmer-ID), `demoData`.
- `src/app/globals.css` – Cupra-Fonts und Design-Tokens, übernommen aus der Streak Challenge.

## Konfiguration anpassen

`src/data/config/demo.json` beziehungsweise `demo2.json` editieren. Das zod-Schema prüft beim Start Referenzen (Comp I: Needs, Marken, Positionen, Lösung je Marke; Comp II: Motive in Features und Personas, keine doppelten Motive je Persona; beide: genau eine CUPRA-Marke). `keywords` nutzt nur der Keyword-Scorer. Neue Konfiguration: Datei anlegen und in `src/data/config/index.ts` registrieren; der Session-Code wählt die Konfiguration.

## Punkte

**Competitor I.** Pro Argument: 1 Punkt Need getroffen, 1 Punkt CUPRA-Differenzierer gegen diesen Wettbewerber, 1 Bonus für einen als entscheidend markierten Differenzierer. Drei Argumente pro Runde, zwei Runden. Matrix: 1 Punkt pro richtig platzierter Marke, CUPRA doppelt.

**Competitor II.** Interview: 1 Punkt pro aufgedecktem Motiv, maximal eins pro Frage, geschlossene Fragen decken nichts auf. Feature: 1 Punkt für ein erkanntes CUPRA-Feature, 1 Punkt zusätzlich, wenn das Paar Feature/Motiv im Modell steht. Drei Features pro Runde. Werte in `src/engine/config.ts`.
