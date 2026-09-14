# Developer-Briefing: Workshop-App Competitor II (Konzept-Umfang zur Aufwandsschätzung)

**Projekt:** CUPRA Global Launch Training, Competitor Product Workshop
**Dieser Workshop:** "Competitor II" (emotional, Marke und Kaufmotive)
**Verhältnis zu Competitor I:** Comp II nutzt dieselbe Plattform und dieselbe Grundmechanik wie Comp I. Dieses Dokument beschreibt vor allem das Neue gegenüber Comp I, damit der Zusatzaufwand schätzbar wird.
**Zweck:** Software-Konzept, Anforderungen, User Stories und Akzeptanzkriterien als Grundlage, um den Umfang des Konzepts belastbar zu schätzen. Es wird kein Prototyp gebaut.
**Reifegrad:** Pitch-Stand. Feinheiten wie die genaue Anzahl der Interviewfragen (zwei oder drei) werden im späteren Feinkonzept festgelegt. Es soll nur vorgestellt werden, was auch umsetzbar ist.
**Stand:** 14.09.2026
**Autor:** Janine Kappenberg (SAPERED), Konzept mit Claude

---

## 1. Kontext in zwei Sätzen

Gleiches Setting wie Comp I: physischer Workshop, bis zu 24 Teilnehmer, vier Fahrzeuge im Raum (2x CUPRA Delta, 2 Wettbewerber, hier Mini und Smart), ein Trainer, Smartphone-App (PWA). Comp II fokussiert auf Marke und emotionale Kaufmotive: die Teilnehmer decken im Gespräch mit einer Persona ihre emotionalen Motive auf und finden dann am Fahrzeug die CUPRA-Features, die auf diese Motive einzahlen.

Ziel dieses Dokuments: den Umfang des Konzepts vollständig genug beschreiben, damit der Aufwand belastbar geschätzt werden kann.

---

## 2. Was aus Competitor I unverändert übernommen wird

Diese Bausteine sind identisch zu Comp I und sollten nicht doppelt geschätzt werden:

- Teilnehmer-PWA per QR, kein App-Store, keine Installation.
- Übergreifende Teilnehmer-Identität mit persistenter User-ID, damit Punkte pro Workshop individuell zugeordnet werden.
- Trainer-/Präsentations-View auf der Leinwand, Session-Steuerung, Phasenwechsel.
- Dialogische Freitext-Eingabe mit KI-Feedback pro Eingabe und Gesamtfeedback.
- Scoring gegen eine feste, pro Markt hinterlegte Ground Truth. Keine manuelle Punktevergabe durch den Trainer.
- Individueller Punktestand, Leaderboard am Ende.
- Realtime-Synchronisation zwischen Trainer-View und Teilnehmer-Apps.
- Konfiguration pro Markt.

---

## 3. Was in Competitor II neu ist

Drei neue Bausteine treiben den Zusatzaufwand:

1. **Entdeckungs-Interview mit der Persona** (Schritt 2 und 3). Der Teilnehmer stellt der Persona Freitextfragen, die KI antwortet in der Rolle und deckt bei passenden Fragen verdeckte Motive auf.
2. **Motiv-Feature-Modell als many-to-many** (Schritt 5). Features zahlen auf mehrere Motive ein, das Matching prüft gültige Feature-Motiv-Paare.
3. **Motiv-Zusammenfassung für den Trainer** (Schritt 6). Die KI clustert alle genannten Features nach Motiv und zeigt das Ergebnis auf der Leinwand.

---

## 4. Ablauf Competitor II

Zwei symmetrische Runden wie in Comp I, hier mit vorgeschaltetem Interview je Persona. Zwei Personas, direkter Fahrzeugvergleich.

1. **Intro** (Trainer): Session, QR-Login, Ziel, Scoring-Prinzip.
2. **Runde 1**
   - Persona 1 stellt sich kurz vor.
   - **Interview:** Teilnehmer stellt einige offene Fragen (Anzahl tbd, siehe Feinkonzept), um die emotionalen Motive von Persona 1 aufzudecken (dialogisch, siehe Abschnitt 7).
   - **Reveal:** aufgedeckte und nicht aufgedeckte Motive werden gezeigt.
   - **Erkundung und Vergleich:** CUPRA gegen Wettbewerber 1 (Mini), geleitet durch die Motive. Emotionale Features sind meist optisch erkennbar, daher zügig (Richtwert 10 Minuten).
   - **Feature-Eingabe:** Top-3-CUPRA-Features, die auf die Motive einzahlen, dialogisch, gematcht gegen das Feature-Motiv-Modell.
3. **Wechsel der Fahrzeuge.**
4. **Runde 2:** gleiche Abfolge mit Persona 2 und Wettbewerber 2 (Smart). So gewinnt der CUPRA gegen Mini mit anderen Features als gegen Smart, dieser Vergleich bleibt erhalten.
5. **Zusammenfassung:** die KI clustert alle eingegebenen Features nach Motiv und stellt es dem Trainer auf der Leinwand dar. Der Trainer macht daraus sein Schlusswort.
6. **Ergebnis:** individuelle Punkte, Leaderboard.

**Zeit:** Mit zwei Personas hat Comp II zwei Interviews, das ist der Zeittreiber. Realistisch sind rund 55 bis 60 Minuten. SAPERED empfiehlt CUPRA, die Workshop-Dauer entsprechend zu erhöhen. Bleibt die Zeit hart bei 45 Minuten, ist der saubere Hebel, das Interview auf zwei Fragen zu kürzen, nicht eine Runde zu streichen.

---

## 5. Funktionale Anforderungen (nur das Neue oder Veränderte)

**A. Session, Identität, Trainer-View:** wie Comp I.

**B. Persona-Interview (neu)**
- B1 Die Persona stellt sich in der App vor.
- B2 Teilnehmer stellt offene Freitextfragen. Anzahl noch offen (tbd, wird im Feinkonzept festgelegt), konfigurierbar.
- B3 Nach jeder Frage antwortet die KI in der Rolle der Persona.
- B4 Trifft die Frage ein noch unentdecktes Motiv, deckt die Antwort dieses Motiv auf und es zählt als entdeckt.
- B5 Geschlossene oder themenferne Fragen decken nichts auf, die Persona gibt einen In-Character-Stups, offener zu fragen.
- B6 Nach den Fragen deckt die App die nicht entdeckten Motive auf.
- B7 Die Darstellung des aufgedeckten Motivs (explizit benannt in einem Layer oder rein optisches Feedback) ist eine Design-Frage fürs Feinkonzept und den Grafiker, kein Aufwandstreiber. Empfehlung: während des Interviews in-character mit dezentem Signal, die explizite Benennung erst beim Reveal (B6).

**C. Erkundung (wie Comp I)**
- C1 CUPRA gegen den Wettbewerber der Runde, geleitet durch die Motive der Runden-Persona. App passiv, Fokus auf dem Fahrzeug.

**D. Feature-Eingabe und Scoring (Mechanik wie Comp I, Inhalt neu)**
- D1 Pro Runde gibt der Teilnehmer bis zu drei CUPRA-Features als Freitext ein, dialogisch mit Feedback pro Feature und Gesamtfeedback.
- D2 Jedes Feature wird einem Motiv zugeordnet und gegen das Feature-Motiv-Modell geprüft (siehe Abschnitt 7 und 8).
- D3 Punkte pro gültigem Feature-Motiv-Paar.

**E. Zusammenfassung nach Motiv (neu)**
- E1 Die KI verdichtet alle von allen Teilnehmern genannten Features und clustert sie nach Motiv.
- E2 Die Ansicht läuft auf der Leinwand, nicht auf den Teilnehmer-Devices.
- E3 Der Trainer nutzt sie für die Abschluss-Zusammenfassung.

**F. Ergebnis und Konfiguration:** Leaderboard wie Comp I. Konfiguration zusätzlich um Personas, Motive und Feature-Motiv-Modell erweitert.

---

## 6. User Stories mit Akzeptanzkriterien (Fokus auf das Neue)

### US-1 Motive im Gespräch aufdecken
Als **Teilnehmer** möchte ich der Persona offene Fragen stellen und über ihre Antworten ihre emotionalen Kaufmotive herausfinden, damit ich das Aufdecken echter Motive übe.
- Ich gebe eine offene Frage als Freitext ein.
- Die Persona antwortet in ihrer Rolle.
- Trifft die Frage ein verdecktes Motiv, wird es in der Antwort erkennbar aufgedeckt und als entdeckt markiert.
- Eine geschlossene oder themenferne Frage deckt nichts auf und ich bekomme einen Hinweis, offener zu fragen.
- Nach der letzten Frage sehe ich, welche Motive ich gefunden habe und welche nicht.

### US-2 Punkte für entdeckte Motive
Als **Trainer/Auftraggeber** möchte ich, dass entdeckte Motive nach festen Regeln bepunktet werden, damit die Punkte objektiv sind.
- Punkte pro aufgedecktem Motiv.
- Maximal ein Motiv pro Frage.
- Die Zuordnung Frage zu Motiv läuft gegen die hinterlegten Motiv-Definitionen, nicht frei (siehe Abschnitt 7).

### US-3 Fahrzeuge entlang der Motive erkunden
Als **Teilnehmer** möchte ich CUPRA und den Wettbewerber entlang der aufgedeckten Motive erleben, damit ich sehe, wo der CUPRA emotional gewinnt.
- Die Motive der Runde leiten die Erkundung.
- Kein Eingabezwang während der Erkundung.

### US-4 CUPRA-Features den Motiven zuordnen
Als **Teilnehmer** möchte ich pro Runde meine Top-3-CUPRA-Features eingeben und je einem Motiv zuordnen, damit ich Feature und emotionale Wirkung verbinde.
- Dialogische Eingabe mit Feedback pro Feature, danach Gesamtfeedback (Mechanik wie Comp I).
- Ein Feature wird gültig gewertet, wenn das Feature-Motiv-Paar im hinterlegten Modell steht.
- Dasselbe Feature kann unter verschiedenen Motiven gültig sein.

### US-5 Zusammenfassung nach Motiv
Als **Trainer** möchte ich am Ende sehen, welche CUPRA-Features die Gruppe für welches Motiv genannt hat, damit ich ein starkes Schlusswort halten kann.
- Die KI clustert alle genannten Features nach Motiv.
- Die Ansicht erscheint auf der Leinwand, nicht auf den Teilnehmer-Devices.
- Nicht nach Persona getrennt, sondern generell über alle Teilnehmer, nach Motiv sortiert.

### US-6 Ergebnis und Identität
Wie Comp I: Leaderboard am Ende, persistente workshopübergreifende User-ID, Punkte pro Workshop individuell zugeordnet.

---

## 7. KI-Logik im Detail (das zentrale Risiko)

Comp II hat zwei KI-gestützte Matcher. Beide arbeiten gegen dieselbe Grundwahrheit, die Motivliste der jeweiligen Persona.

**Matcher A, Interview: Frage zu Motiv.**
- Jedes Motiv der Persona ist definiert mit Label, kurzer Beschreibung, zwei bis drei Beispiel-Themen und einem In-Character-Aufdeck-Satz.
- Die KI klassifiziert die freie Frage semantisch gegen diese Motiv-Themen. Öffnet die Frage das Themenfeld eines noch unentdeckten Motivs, wird es aufgedeckt.
- Stellschrauben für Fairness: maximal ein Motiv pro Frage, ein Schwellenwert (nur klare Treffer decken auf, Grenzfälle bekommen den Stups), die Persona erfindet nie Motive außerhalb der Liste.
- Ablauf synchron im Dialog, wenige Sekunden pro Frage.

**Matcher B, Feature-Eingabe: Feature zu Motiv.**
- Grundwahrheit ist eine hinterlegte Menge gültiger Feature-Motiv-Paare, many-to-many.
- Der Teilnehmer nennt ein Feature und ordnet es einem Motiv zu. Gültig, wenn das Paar in der Menge steht.
- Dasselbe Feature ist unter mehreren Motiven gültig, keine erzwungene Eindeutigkeit.
- Mechanik ansonsten wie das Scoring in Comp I.

**Für die Schätzung:** Beide Matcher sind echte KI-Klassifikation. Der Aufwandshebel ist derselbe wie in Comp I, echtes LLM versus vereinfachtes, regelbasiertes Verfahren, hier aber zweimal (Interview und Feature). Bitte beide getrennt ausweisen.

---

## 8. Motiv- und Feature-Modell (illustratives Gerüst)

Final liefert CUPRA die Inhalte. Das folgende Gerüst zeigt nur die Struktur und dass Features bewusst auf mehrere Motive einzahlen.

Vier Beispiel-Motive: Auffallen und Anderssein, Fahrfreude, Design als Selbstausdruck, Premium und etwas Besonderes besitzen.

Beispiel für gültige Feature-Motiv-Paare:

| Feature (Beispiel) | zahlt ein auf |
|---|---|
| Markantes Exterieur, Kupfer-Akzente | Auffallen, Design |
| Sportsitze, fahrerorientiertes Cockpit | Fahrfreude, Premium |
| Ambientelicht, Innenraum-Details | Design, Premium |
| Spürbare Beschleunigung, VZ-Charakter | Fahrfreude, Auffallen |
| Sennheiser-Sound | Premium, Fahrfreude |
| Besondere Farb- und Trimm-Optionen | Auffallen, Design |
| Materialqualität, Verarbeitung | Premium, Design |

Fast jedes Feature trifft zwei Motive, deshalb die many-to-many-Struktur.

---

## 9. Nicht-funktionale Anforderungen

Wie Comp I. Zusätzlich: das Interview-Feedback pro Frage ist synchron mit kurzer Antwortzeit von wenigen Sekunden, individuell, nicht raumweit.

---

## 10. Umfang zur Schätzung

**Neu zu bauen (auf der Comp-I-Plattform):**
- Persona-Interview-Screen mit dialogischer Freitext-Eingabe und In-Character-Antworten.
- Matcher A, Frage zu Motiv, inklusive Reveal der nicht entdeckten Motive.
- Feature-Motiv-Modell als many-to-many plus Matcher B.
- Motiv-Zusammenfassung, KI-Clustering nach Motiv, Darstellung auf der Leinwand.
- Erweiterte Konfiguration um Personas, Motive und Feature-Motiv-Paare.

**Aus Comp I wiederverwendet (nicht doppelt schätzen):** Session, Identität, Trainer-View, dialogische Eingabe-Mechanik, Scoring-Grundgerüst, Leaderboard, Realtime, Konfigurations-Grundgerüst.

**Schätz-Hebel, bitte getrennt ausweisen:**
- KI-Interview-Matcher echt versus vereinfacht.
- KI-Feature-Matcher echt versus vereinfacht.
- Aufwand der Motiv-Zusammenfassung (Clustering und Darstellung).

**Nicht Teil dieses Workshops:** finales visuelles Design (Grafiker), breiter Multi-Markt-Rollout, alles was schon in Comp I als out of scope steht.

---

## 11. Datenmodell (Delta zu Comp I)

- **Persona** (id, Vorstellungstext, Motivliste)
- **Motive** (id, personaRef, Label, Beschreibung, Beispiel-Themen, Aufdeck-Satz)
- **InterviewTurn** (userRef, round, frageText, aufgedecktesMotiv oder keins, points)
- **FeatureMotiveMap** (Menge gültiger Paare aus Feature und Motiv, many-to-many)
- **FeatureSubmission** (userRef, round, featureText, zugeordnetesMotiv, gültig, points)
- Session, User, Participation, Leaderboard: wie Comp I.

---

## 12. Offene Punkte und Abhängigkeiten

- **Von CUPRA:** je Persona die Motive mit Beschreibung und Beispiel-Themen, das Feature-Motiv-Modell, die zwei Personas selbst, finale Copy.
- **Reifegrad Pitch:** Anzahl der Interviewfragen und die Darstellung des Motiv-Reveals (explizit benannt in einem Layer oder rein optisches Feedback) werden im Feinkonzept mit dem Grafiker festgelegt.
- **Dauer:** SAPERED empfiehlt CUPRA, die Workshop-Dauer auf rund 55 bis 60 Minuten zu erhöhen. Alternative Kürzung nur über die Fragenzahl, nicht über eine Runde.
- **Vom Grafiker:** finales Visual, inklusive der Darstellung der Motiv-Zusammenfassung.
- **Zu entscheiden mit dem Developer:** echtes versus vereinfachtes Verfahren, je Matcher getrennt.

---

## 13. Annahmen

- Comp II baut auf der Comp-I-Plattform auf, die geteilten Bausteine existieren bereits oder werden dort geschätzt.
- Zwei Personas, zwei Runden, direkter Fahrzeugvergleich, Feature-Eingabe pro Runde.
- Der CUPRA Delta ist baugleich zum CUPRA Raval, Inhalte sind übertragbar. Offizielle Inhalte kommen von CUPRA.
- Dieses Dokument dient der Aufwandsschätzung des Konzepts, nicht dem Bau eines Prototyps.
