# Developer-Briefing: Workshop-App (Konzept-Umfang zur Aufwandsschätzung)

**Projekt:** CUPRA Global Launch Training, Competitor Product Workshop
**Referenz-Workshop:** "Competitor I" (rational)
**Zweck dieses Dokuments:** Software-Konzept, Anforderungen, User Stories und Akzeptanzkriterien als Grundlage, um den Umfang des aktuellen Konzepts belastbar zu schätzen. Es geht nicht darum, jetzt einen Prototyp zu bauen, sondern den Aufwand ordentlich einzuschätzen.
**Stand:** 10.09.2026
**Autor:** Janine Kappenberg (SAPERED), Konzept mit Claude

---

## 1. Kontext in zwei Sätzen

Physischer Workshop mit bis zu 24 Teilnehmern, vier Fahrzeugen im Raum (2x CUPRA Delta, 2 Wettbewerber), einem Trainer und 45 Minuten Zeit. Die Teilnehmer erkunden die Fahrzeuge angeleitet über eine Smartphone-App (PWA), formulieren Verkaufsargumente, sammeln Punkte und schließen mit einer gemeinsamen Positionierungs-Übung ab. Ziel des Trainings ist beobachtbares Verhalten: der Teilnehmer kann die Value Proposition und die Key Sales Arguments des CUPRA gegen den Wettbewerb benennen.

Ziel dieses Dokuments: den Umfang des Konzepts vollständig genug beschreiben, damit der Aufwand belastbar geschätzt werden kann. Ein Prototyp muss dafür nicht gebaut werden.

---

## 2. Software-Konzept (High Level)

Drei Bausteine:

1. **Teilnehmer-PWA** (Smartphone, Zugang per QR-Code, kein App-Store, keine Installation). Führt durch den Workshop-Flow: Persona, Exploration, Argument-Eingabe, Positionierung, Ergebnis.
2. **Trainer-/Präsentations-View** (auf Leinwand projiziert). Startet die Session, steuert Übergänge, zeigt die Positionierungs-Matrix und das Leaderboard. Der Trainer zeigt die Matrix **app-nativ**, nicht als PowerPoint-Slide.
3. **Backend** mit Session-Verwaltung, KI-gestütztem Scoring der Freitext-Argumente und einer Konfiguration pro Markt/Workshop (Personas, Kategorien, Differenzierungsliste, Matrix-Achsen und Lösungsschlüssel).

**Tragende Prinzipien (wichtig für Design und Scope):**

- **Freitext plus KI-Raster.** Teilnehmer formulieren eigene Argumente. Bewertet wird nicht die Meinung, sondern gegen ein festes Regelwerk (siehe Abschnitt 7). Ground Truth ist eine pro Markt hinterlegte Konfiguration.
- **Erkundung im Fokus.** Während der Exploration ist die App bewusst passiv (kein Tippen), sie leitet nur über Kategorien. Interaktion passiert davor und danach.
- **Single Source of Truth für die Matrix.** Die Positionierungs-Matrix lebt einmal im System und wird in zwei Ansichten gerendert (Trainer-Leinwand und Teilnehmer-App). Es gibt keine zweite Matrix in PowerPoint. Damit können Anzeige und Punktevergabe nicht auseinanderlaufen.
- **Punkte in jedem Workshop.** Individuelles Scoring, sichtbarer Punktestand, Leaderboard am Ende.
- **Übergreifende Teilnehmer-Identität.** Login und Identität werden einmal für alle Workshops definiert. Der QR-Code bringt in die Session, zusätzlich wird eine persistente User-ID erfasst, damit die pro Workshop erspielten Punkte demselben Teilnehmer zugeordnet und über die Workshop-Reihe zusammengeführt werden können.

---

## 3. Rollen

- **Teilnehmer:** nimmt per QR an einer Session teil, wird über eine persistente, workshopübergreifende User-ID identifiziert, durchläuft den Flow und sammelt individuelle Punkte.
- **Trainer:** startet und steuert die Session, präsentiert Matrix und Leaderboard.
- **Konfigurator/Admin:** hinterlegt pro Markt/Workshop die Inhalte und den Lösungsschlüssel (minimal gehalten, siehe Umfang zur Schätzung).

---

## 4. Funktionale Anforderungen (gruppiert)

**A. Session und Zugang**
- A1 Trainer erzeugt eine Session und wählt die Anzahl der Gruppen.
- A2 System erzeugt QR-Codes (pro Gruppe oder pro Session).
- A3 Teilnehmer tritt per Scan bei; dabei wird eine persistente User-ID erfasst, damit erspielte Punkte individuell zugeordnet werden. Anzeigename optional.
- A4 Geräte einer Gruppe sind derselben Session zugeordnet.
- A5 Die User-ID und die Login-Logik werden übergreifend für alle Workshops definiert (eine Mechanik für die ganze Reihe), sodass Punkte pro Workshop demselben Teilnehmer zugeordnet und aggregiert werden können.

**B. Persona und Exploration**
- B1 App zeigt die Persona mit ihren Needs.
- B2 App zeigt die Erkundungs-Kategorien mit konkreten Prompts (aufklappbar).
- B3 Während der Exploration keine Eingabepflicht, reine Anleitung.

**C. Argument-Erfassung, Dialog und Scoring**
- C1 Teilnehmer gibt seine Argumente nacheinander als Freitext ein, eines nach dem anderen (Ziel: drei).
- C2 Nach jedem Argument bewertet die KI es gegen das Raster (Abschnitt 7) und zeigt sofort ein kurzes, formatives Feedback.
- C3 Das abgesendete Argument ist danach gesetzt, der Teilnehmer geht zum nächsten. Kein Wiederholen desselben Arguments zum Punktesammeln.
- C4 Nach dem dritten Argument zeigt die App ein Gesamtfeedback (Zusammenfassung plus erreichte Punkte).
- C5 Der individuelle Punktestand wird geführt und ist spätestens im Outro sichtbar.

**D. Positionierungs-Matrix (Outro)**
- D1 Trainer-View zeigt die Matrix (zwei Achsen, Markenset) app-nativ.
- D2 Teilnehmer ordnen in ihrer App alle Marken den Positionen zu.
- D3 System bewertet die Zuordnung gegen den hinterlegten Lösungsschlüssel, doppelte Punkte für den korrekt platzierten CUPRA.
- D4 Trainer deckt die gesamte Auflösung auf einmal auf der Leinwand auf, nicht schrittweise.

**E. Ergebnis**
- E1 Leaderboard am Ende (individuell).
- E2 Trainer kann das Ergebnis auf der Leinwand zeigen.

**F. Konfiguration**
- F1 Personas, Kategorien und Prompts sind konfigurierbar.
- F2 Differenzierungsliste und Need-Liste (Ground Truth fürs Scoring) sind hinterlegbar.
- F3 Matrix-Achsen, Markenset und Lösungsschlüssel sind pro Markt konfigurierbar.

---

## 5. User Stories mit Akzeptanzkriterien

### US-1 Session beitreten und identifiziert werden
Als **Teilnehmer** möchte ich per QR-Code schnell beitreten und dabei eindeutig identifiziert werden, damit die Punkte, die ich pro Workshop erspiele, mir individuell zugeordnet werden.
- Scan öffnet die PWA im mobilen Browser, ohne App-Store und ohne Installation.
- Ich lande in der richtigen Session/Gruppe.
- Beim Beitritt wird eine persistente User-ID erfasst, die über alle Workshops gleich bleibt.
- Meine Punkte pro Workshop werden dieser ID zugeordnet und können über die Reihe zusammengeführt werden.
- Optionaler Anzeigename wird übernommen und im Leaderboard genutzt.
- Verlorene Verbindung: Wiederaufruf führt mich in denselben Zustand und unter derselben ID zurück.

### US-2 Persona verstehen
Als **Teilnehmer** möchte ich die Persona und ihre Bedürfnisse sehen, damit ich weiß, für wen ich argumentiere.
- Persona-Text und Needs sind lesbar dargestellt.
- Inhalt kommt aus der Konfiguration, nicht hartkodiert.

### US-3 Fahrzeuge angeleitet erkunden
Als **Teilnehmer** möchte ich über Kategorien mit konkreten Prompts durch die Erkundung geführt werden, damit ich weiß, worauf ich am Auto achten soll.
- Kategorien sind aufklappbar, mit Prompt-Text.
- Kein Eingabezwang in dieser Phase.
- Reihenfolge oder Auswahl der Kategorien ist konfigurierbar.

### US-4 Argumente im Dialog eingeben
Als **Teilnehmer** möchte ich meine Argumente eines nach dem anderen frei formulieren und nach jedem eine Rückmeldung bekommen, damit sich die Eingabe wie ein Dialog anfühlt und ich dazulerne.
- Ich gebe ein Argument als Freitext ein und sende es ab.
- Direkt danach erscheint ein kurzes KI-Feedback zu genau diesem Argument.
- Dann gebe ich das nächste ein, bis drei stehen.
- Ein abgesendetes Argument ist gesetzt und wird nicht zum Punktefarmen wiederholt.
- Abschluss ist auch mit weniger als drei möglich.

### US-5 Feedback pro Argument und Gesamtfeedback
Als **Teilnehmer** möchte ich nach jedem Argument eine kurze Rückmeldung und am Ende ein Gesamtfeedback, damit ich verstehe, wie gut meine Argumente zu den Bedürfnissen der Persona passen.
- Nach jedem Argument erscheint ein kurzes, formatives KI-Feedback (ein bis zwei Sätze, ermutigend, mit Hinweis worauf es ankommt).
- Das Feedback erscheint zügig (wenige Sekunden), da es individuell ist und nicht den ganzen Raum synchronisiert.
- Nach dem dritten Argument erscheint ein Gesamtfeedback mit Zusammenfassung und erreichten Punkten.
- Die visuelle Gestaltung des Feedbacks ist Platzhalter für den Grafiker.

### US-6 Argumente werden objektiv bepunktet
Als **Trainer/Auftraggeber** möchte ich, dass Freitext-Argumente nach einem festen Regelwerk bewertet werden, damit die Punkte objektiv und für alle gleich sind.
- Jedes Argument wird gegen die binären Kriterien aus Abschnitt 7 geprüft.
- Bewertung läuft asynchron im Hintergrund, ohne Wartezeit im Raum.
- Ergebnis liegt spätestens vor dem Outro vor.
- Gleichartige Argumente erhalten dieselbe Punktzahl.

### US-7 Positionierung zuordnen
Als **Teilnehmer** möchte ich im Outro die Marken den Positionen der Matrix zuordnen, damit ich zeige, ob ich die Positionierung verstanden habe.
- Alle Marken (anwesend und nicht anwesend) sind als Kacheln wählbar.
- Ich ordne alle Marken den Positionen zu und sende einmal ab (Ganz-auf-einmal, siehe Abschnitt 8).
- Punkte für korrekte Zuordnung, doppelte Punkte für den CUPRA.

### US-8 Matrix präsentieren
Als **Trainer** möchte ich die Matrix auf der Leinwand app-nativ zeigen und die gesamte Lösung auf einmal aufdecken, damit die Gruppe die Abweichung zwischen Vermutung und Wahrheit sieht, ohne in Zeitnot zu kommen.
- Trainer-View rendert dieselbe Matrix-Konfiguration wie die Teilnehmer-App.
- Die Auflösung wird komplett auf einmal aufgedeckt, nicht schrittweise.
- Änderung an der Konfiguration wirkt in beiden Ansichten gleich (eine Quelle).

### US-9 Ergebnis sehen
Als **Teilnehmer und Trainer** möchte ich am Ende ein Leaderboard sehen, damit der Wettbewerb sichtbar abgeschlossen wird.
- Individuelles Ranking wird berechnet und angezeigt.
- Trainer kann es auf der Leinwand zeigen.

### US-10 Workshop konfigurieren
Als **Konfigurator** möchte ich Inhalte und Lösungsschlüssel pro Markt hinterlegen, damit dieselbe App für verschiedene Märkte funktioniert.
- Personas, Kategorien, Prompts, Differenzierungs- und Need-Liste, Matrix-Achsen, Markenset und Lösungsschlüssel sind konfigurierbar.
- Die Lösung soll so einfach und günstig wie möglich sein, aber trotzdem ohne technisches Wissen bedienbar. Kein Editieren von Raw-Code durch den Fachanwender. Bevorzugt ein strukturiertes Template (zum Beispiel Formular oder Tabelle mit Import) statt einer aufwendigen Admin-Oberfläche.
- Für die Schätzung bitte getrennt ausweisen: einfaches Template versus komfortableres Admin-UI.

---

## 6. Nicht-funktionale Anforderungen

- **Plattform:** PWA, mobile Browser (iOS Safari, Android Chrome), Trainer-View im Desktop-Browser für die Leinwand.
- **Gleichzeitigkeit:** rund 24 Teilnehmer plus 1 Trainer je Session, ein Raum.
- **Realtime:** Trainer-Steuerung und Teilnehmer-App müssen zustandssynchron sein (Sessionphase, Matrix-Auflösung, Leaderboard). Latenz im Sekundenbereich ist akzeptabel.
- **Robustheit:** Reconnect ohne Datenverlust, da im Raum das Netz schwanken kann.
- **KI-Scoring:** regelbasiert und konsistent, pro Argument synchron mit kurzer Antwortzeit von wenigen Sekunden für das dialogische Feedback (siehe Abschnitt 7).
- **Datenschutz:** Es wird eine persistente User-ID erfasst, um Punkte individuell zuzuordnen. Diese ID muss kein Klarname sein, ein Anzeigename genügt. Keine Erhebung personenbezogener Daten über das Nötige hinaus. Die Identitäts-Mechanik wird übergreifend für alle Workshops festgelegt.
- **Mehrsprachigkeit:** perspektivisch mehrere Märkte, für die Schätzung einsprachig (Inhalt Englisch) ausreichend, Mehrsprachigkeit als spätere Option.

---

## 7. KI-Scoring im Detail (das zentrale Risiko)

**Eingabe je Argument:** Freitext plus Kontext aus der Konfiguration (Persona-Needs, aktueller Wettbewerber, Differenzierungsliste).

**Regelwerk (binär, nicht Bauchgefühl):**
- Kriterium 1: Adressiert das Argument ein tatsächlich genanntes Need der Persona? ja/nein
- Kriterium 2: Benennt es einen realen, gelisteten CUPRA-Differenzierer gegenüber genau diesem Wettbewerber? ja/nein
- Optional Bonus: Trifft es einen der als entscheidend markierten Differenzierer?

**Wichtig:** Es gibt keine einzig richtige Antwort. Viele verschiedene Formulierungen können volle Punkte erreichen. Bewertet wird die gültige Brücke Feature zu Need, nicht der Stil.

**Ausgabe pro Argument:** ein kurzes, formatives Feedback sofort nach der Eingabe, plus die intern gezählten Punkte. Die Bewertung pro Argument ist damit synchron, mit kurzer Wartezeit von wenigen Sekunden (individuell, nicht raumweit). Nach dem dritten Argument folgt ein Gesamtfeedback mit Zusammenfassung und Punktestand. Das Feedback pro Argument ist coachend (worauf es ankommt), nicht bloß ein Richtig/Falsch, damit es nicht zum Rateln einlädt.

**Abhängigkeit:** Differenzierungsliste und Need-Liste als Ground Truth kommen von CUPRA. Ohne sie ist das Scoring willkürlich.

**Wesentlicher Schätz-Hebel:** echtes LLM-Scoring pro Argument gegen die Liste versus ein vereinfachtes, regelbasiertes Feedback. Beide Varianten bitte getrennt schätzen, das ist der größte Aufwandstreiber.

---

## 8. Positionierungs-Matrix (app-native)

- **Konfiguration pro Markt:** zwei Achsen, Markenset, Lösungsschlüssel (Soll-Position je Marke).
- **Teilnehmer:** ordnen alle Marken auf einmal zu und senden ab. Scoring gegen den Schlüssel, doppelt für CUPRA.
- **Trainer:** zeigt die Matrix auf der Leinwand aus derselben Konfiguration und deckt die gesamte Lösung auf einmal auf, nicht schrittweise, das spart Zeit.
- **Bewusste Design-Entscheidung:** Ganz-auf-einmal-Zuordnung statt getaktetem "ein Auto, alle raten gleichzeitig". Grund: keine Live-Synchronisation zwischen Anzeige und Eingabe nötig, robust gegen Änderungen an der Reihenfolge. Falls doch getaktet gewünscht, genügt ein Trainer-Klick, der den App-Status weiterschaltet, keine Fahrzeug-Hardware.

---

## 9. Umfang zur Schätzung

**Kern-Umfang des Konzepts (zu schätzen), Referenz Competitor I:**
- Session, Beitritt per QR, plus Erfassung der persistenten, workshopübergreifenden User-ID.
- Persona-Screen plus Exploration-Screen mit Kategorien und Prompts. Das Konzept sieht zwei Runden mit je eigener Persona vor.
- Dialogische Argument-Eingabe: Feedback pro Argument und Gesamtfeedback, inklusive Scoring und individuellem Punktestand.
- Positionierungs-Matrix app-nativ: Zuordnung aller Marken auf einmal, Auflösung auf einmal, Scoring gegen den Schlüssel.
- Trainer-View: Session starten, Phasen steuern, Matrix zeigen und auflösen.
- Leaderboard.
- Konfiguration pro Markt (einfach und günstig, aber ohne technisches Wissen bedienbar).

**Nicht Teil des aktuellen Konzepts (nicht schätzen oder klar als spätere Option ausweisen):**
- Workshop "Competitor II" (emotional) inklusive Gruppenbild-am-Fahrzeug-Wow, das ist ein eigenes Konzept.
- Finales visuelles Design, kommt vom Grafiker.
- Authentifizierung, Accounts, Analytics, Offline-Härtung, Skalierung über einen Raum hinaus, breiter Multi-Markt-Rollout.

**Schätz-Hebel, bitte getrennt ausweisen:**
- KI-Scoring und dialogisches Feedback: echtes LLM pro Argument versus vereinfachtes, regelbasiertes Feedback.
- Realtime-Framework für die Trainer-zu-Teilnehmer-Synchronisation.
- Konfigurationslösung: einfaches Template versus komfortableres Admin-UI.
- Anzahl und Komplexität der Screens.

---

## 10. Datenmodell (grobe Skizze zur Orientierung)

- **Session** (id, Phase, Gruppen)
- **User** (persistente userId über alle Workshops, optional Anzeigename)
- **Participation** (userRef, sessionRef, workshopRef, Score pro Workshop)
- **Config** (marketRef, Personas, Categories, DifferentiatorList, NeedList, MatrixAxes, BrandSet, SolutionKey)
- **ArgumentSubmission** (userRef, round, text, evaluation, points)
- **MatrixPlacement** (userRef, brand, position, correct, points)

---

## 11. Offene Punkte und Abhängigkeiten

- **Von CUPRA:** Differenzierungsliste und Need-Liste (Scoring-Ground-Truth), Matrix-Achsen, Markenset und Lösungsschlüssel, finale Fahrzeugdaten, finale Copy.
- **Vom Grafiker:** finales Visual der Screens, Gestaltung des Feedback-Elements, Matrix-Darstellung.
- **Zu entscheiden mit dem Developer:** echtes versus vereinfachtes KI-Scoring, Wahl des Realtime-Frameworks, Ausbaustufe der Konfigurationslösung.
- **Übergreifend zu definieren:** die konkrete Mechanik der User-Identifikation (zum Beispiel vorab vergebene Codes oder Badge-Scan), einheitlich für alle Workshops. Für dieses Konzept genügt, dass eine persistente User-ID vorliegt.
- **Organisatorisch:** bringen alle Teilnehmer ein eigenes Smartphone mit, Netz/WLAN im Raum.

---

## 12. Annahmen

- Der CUPRA Delta ist baugleich zum CUPRA Raval, Inhalte und Vorteile sind übertragbar. Offizielle Zahlen und der Lösungsschlüssel kommen von CUPRA.
- Bis zu 24 Teilnehmer, 1 Trainer, 1 Raum, vorhandene Smartphones.
- Dieses Dokument dient der Aufwandsschätzung des Konzepts. Ein Prototyp ist nicht Gegenstand.
