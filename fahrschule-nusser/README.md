# Fahrschule Nusser – neue Website mit Fahrschüler-Portal

Ein vollständiger Neuaufbau des Internetauftritts der Fahrschule Nusser in Paderborn:
eine moderne, für Handys optimierte Website plus ein Bereich, in dem sich Fahrschüler
anmelden und ihren Ausbildungsstand einsehen können – und in dem die Fahrschule alles
selbst pflegt.

> **Wichtig vor dem Livegang:** Diese Fassung enthält an mehreren Stellen Platzhalter,
> die noch durch echte Angaben ersetzt werden müssen – vor allem Preise, Team, Bürozeiten,
> Impressum und Datenschutzerklärung. Alle Platzhalter sind im Text mit `TODO` markiert
> und werden beim Aufruf im Browser gelb hervorgehoben, damit keiner übersehen wird.
> Eine Liste steht weiter unten unter „Was noch fehlt“.

## Was die Seite kann

### Öffentlicher Bereich

| Seite | Inhalt |
| --- | --- |
| Startseite | Überblick, Vertrauenszahlen, Klassen, Ablauf, Standorte, häufige Fragen |
| Führerschein | Alle Klassen nach Auto, Motorrad und Weiteres sortiert, mit Kostenübersicht |
| Ablauf | Der Weg zum Führerschein in sechs Schritten, Unterlagen, Pflichtstunden |
| Standorte | Alle Standorte mit Adresse, Unterrichtszeiten und Telefonnummer |
| Team | Die Fahrlehrerinnen und Fahrlehrer |
| Fragen | Häufige Fragen zum Auf- und Zuklappen |
| Kontakt | Kontaktformular, das direkt in der Verwaltung landet |
| Anmeldung | Online-Anmeldung mit Klassen- und Standortwahl |
| Impressum, Datenschutz | Pflichtseiten (noch zu vervollständigen) |

### Wer darf was

| | Fahrschüler | Fahrlehrer | Fahrschule (Büro) |
| --- | --- | --- | --- |
| Eigenen Ausbildungsstand sehen | ✓ | – | – |
| Theorietermine buchen | ✓ | – | – |
| Eigene Rechnungen einsehen | ✓ | – | – |
| Fahrstunden eintragen | – | ✓ | ✓ |
| Alle Fahrschüler sehen | – | ✓ | ✓ |
| Anwesenheit im Theorieunterricht abhaken | – | eigener Standort | ✓ |
| Prüfungsstand setzen | – | ✓ | ✓ |
| Notiz für den Fahrschüler schreiben | – | ✓ | ✓ |
| Theorietermine festlegen und ändern | – | eigener Standort | ✓ |
| Fahrschüler aufnehmen | – | eigener Standort | ✓ |
| Fahrlehrer anlegen, Standorte zuweisen | – | – | ✓ |
| Fahrschüler löschen | – | – | ✓ |
| Übertrag alter Fahrstunden und Lektionen | – | – | ✓ |
| Rechnungen schreiben | – | – | ✓ |

### Fahrschüler-Portal

- **Anmeldung ohne Passwort:** E-Mail-Adresse eingeben, Link per Mail bekommen, fertig.
  Der Link gilt 30 Minuten und funktioniert nur einmal.
- **Übersicht:** Ausbildungsstand auf einen Blick, nächste Termine, Mitteilungen, Unterlagen.
- **Theorietermine:** alle kommenden Termine mit Anmeldung und Abmeldung per Klick,
  inklusive Platzbegrenzung. Bereits besuchte Lektionen sind markiert.
- **Fortschritt:** besuchte Pflichtlektionen, Übungsstunden, Sonderfahrten je Art,
  Prüfungsstand und eine persönliche Notiz des Fahrlehrers.
- **Rechnungen:** alle Rechnungen der Fahrschule, mit offenem Gesamtbetrag auf einen
  Blick. Jede Rechnung lässt sich als sauberes Blatt öffnen, drucken oder als PDF
  speichern. Fahrschüler sehen ausschließlich ihre eigenen.
- **Unterlagen:** Dokumente, die für alle oder gezielt für eine Person hinterlegt sind.
- **Meine Daten:** eigene Kontaktdaten pflegen.

### Fahrlehrer-Bereich

Fahrlehrer melden sich genauso an wie Fahrschüler – mit ihrer E-Mail-Adresse, ohne
Passwort. Sie sehen eine Liste aller Fahrschüler; die eigenen stehen oben, damit eine
Vertretung trotzdem möglich bleibt.

Nach der Fahrt wird die Fahrstunde eingetragen: Datum, Dauer in Einheiten zu 45
Minuten, die Art der Fahrt (Übungsstunde oder eine der Sonderfahrten) und wahlweise
eine Notiz. Der Ausbildungsstand des Fahrschülers aktualisiert sich damit sofort –
er sieht ihn unmittelbar in seinem Portal.

Zwei Regeln schützen vor Durcheinander: Ein Fahrlehrer kann nur die eigenen Einträge
wieder löschen, und eine Fahrstunde, die schon auf einer Rechnung steht, lässt sich
gar nicht mehr löschen. Sonst würde die Rechnung nicht mehr zu den Stunden passen.

#### Der eigene Standort

Jeder Standort wird von seinen Fahrlehrern selbst verwaltet – üblicherweise sind das
zwei pro Standort. Das Büro weist unter „Fahrlehrer“ zu, wer welchen Standort betreut;
ein Fahrlehrer kann auch mehrere übernehmen.

Im Fahrlehrer-Bereich steht die Liste aller Fahrschüler mit **Suchfeld**: Namen
eintippen, die Liste filtert sofort mit (Groß- und Kleinschreibung sowie Umlaute sind
dabei egal, „schafer" findet also auch „Schäfer"). Ein Tippen auf den Namen führt
direkt zur Seite, auf der die Fahrstunden eingetragen werden.

Für die eigenen Standorte darf ein Fahrlehrer:

- **Theorietermine festlegen**, ändern und löschen – also bestimmen, wann welches Thema
  dran ist
- **Fahrschüler aufnehmen**, samt Zugangsmail. Offene Online-Anmeldungen, die zum
  eigenen Standort passen, stehen dabei zum Übernehmen bereit
- **die Anwesenheit führen** (siehe unten)

Termine anderer Standorte sind sichtbar, aber nicht bearbeitbar – so bleibt der
Gesamtplan im Blick, ohne dass sich zwei Standorte gegenseitig in die Quere kommen.
Das Büro darf weiterhin alles, an jedem Standort.

Ist einem Fahrlehrer noch kein Standort zugewiesen, sieht er alles, kann aber nichts
anlegen; die Seiten sagen ihm das und verweisen aufs Büro.

#### Anwesenheit im Theorieunterricht

Zu Beginn des Unterrichts geht der Fahrlehrer den Termin durch und hakt ab, wer da
ist. Die Lektion dieses Termins zählt damit für alle Abgehakten – niemand muss sie
bei jedem Fahrschüler einzeln nachtragen.

Auf der Liste stehen **die Fahrschüler des Standorts**, an dem der Unterricht
stattfindet – nicht alle der Fahrschule. Dazu kommen alle, die sich für genau diesen
Termin angemeldet haben, auch wenn sie sonst zu einem anderen Standort gehören; sie
sind entsprechend gekennzeichnet, damit niemand aus der Liste fällt, der extra
gekommen ist. Ab sechs Namen erscheint ein Suchfeld. Dass nur der eigene Standort
zählt, prüft auch der Server: Wer nicht auf der Liste stehen dürfte, lässt sich auch
über einen manipulierten Aufruf nicht abhaken.

Die angemeldeten Fahrschüler sind vorausgewählt, weil das der häufigste Fall ist. Wer
trotz Anmeldung gefehlt hat, wird abgewählt. Zwei Schaltflächen wählen alle oder keinen aus, und wer
abgehakt ist, wird grün hinterlegt – das lässt sich auch im Stehen am Handy bedienen.

Die Liste ist jederzeit korrigierbar: Beim Speichern gilt genau, wer angehakt ist.
Nimmt man jemanden wieder heraus, verliert er die Lektion aus diesem Termin – hat er
sie in einem anderen Termin besucht, bleibt sie erhalten. Ein kleiner Hinweis in der
Zeile zeigt, wer die Lektion schon anderswo besucht hat.

Fahrlehrer setzen außerdem beim einzelnen Fahrschüler den Stand der theoretischen und
praktischen Prüfung und schreiben die Notiz, die er in seinem Portal sieht.

Beim Büro bleibt nur der **Übertrag** aus der Zeit vor dem Portal – alte Fahrstunden
und Lektionen, eine einmalige Sache beim Umstieg, die im laufenden Betrieb niemand
mehr anfassen sollte.

Zwei Arten von Notizen, die nicht verwechselt werden sollten: Die Notiz an einer
einzelnen Fahrstunde sieht nur die Fahrschule. Die Notiz im Block „Theorie und
Prüfungen“ steht im Portal des Fahrschülers.

### Verwaltung (für die Fahrschule)

- **Übersicht:** offene Anfragen, Anzahl Fahrschüler, nächste Termine und wer
  kurz vor der praktischen Prüfung steht.
- **Anfragen:** alle Kontaktanfragen und Online-Anmeldungen. Eine Anmeldung lässt sich
  mit einem Klick in einen Portalzugang umwandeln – die Begrüßungsmail geht automatisch raus.
- **Fahrschüler:** anlegen, Stammdaten pflegen, Stammfahrlehrer zuordnen und den
  Ausbildungsstand einsehen. Prüfungsstand und Notiz kann das Büro ebenfalls setzen –
  im laufenden Betrieb macht das aber meist der Fahrlehrer selbst.
- **Theorietermine:** Termine anlegen und ändern, Teilnehmerlisten ansehen und ausdrucken.
- **Fahrlehrer:** anlegen, Angaben pflegen, **Standorte zuweisen**, Zugang entfernen.
  Beim Anlegen geht die Zugangsmail automatisch raus. Wird ein Zugang entfernt, bleiben die eingetragenen
  Fahrstunden erhalten – sie gehören zur Ausbildung des Fahrschülers.
- **Rechnungen:** Rechnung schreiben, Zahlungseingang festhalten, stornieren. Die noch
  nicht abgerechneten Fahrstunden eines Fahrschülers werden dabei automatisch zu
  Positionen zusammengefasst (gleichartige Fahrten in einer Zeile), weitere Positionen
  wie Grundbetrag oder Lernmaterial lassen sich ergänzen. Eine Stornierung gibt die
  Fahrstunden wieder frei, sodass korrigiert neu abgerechnet werden kann.
- **Unterlagen und Mitteilungen:** Dokumente hinterlegen und kurze Nachrichten
  veröffentlichen, die alle Fahrschüler im Portal sehen.

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) ab Version 18.

```bash
cd fahrschule-nusser
npm install
cp .env.example .env
npm start
```

Dann `http://localhost:3000` im Browser öffnen. Für automatischen Neustart beim
Entwickeln: `npm run dev`.

Beim ersten Start wird automatisch ein Verwaltungszugang mit der Adresse aus
`SEED_ADMIN_EMAIL` angelegt. Zum Anmelden:

1. `http://localhost:3000/portal/login` aufrufen und diese Adresse eintragen
2. Solange kein E-Mail-Versand eingerichtet ist, steht der Anmeldelink in der
   Serverkonsole und in `data/outbox.log` – von dort kopieren und im Browser öffnen

## Inhalte ändern

**Alle Texte, Adressen, Preise, Zeiten, Team und häufigen Fragen stehen in einer
einzigen Datei:** [`src/content.js`](src/content.js). Wer dort etwas ändert und den
Server neu startet, sieht die Änderung sofort auf der Seite – ohne HTML anzufassen.

Die Datei ist in Abschnitte gegliedert:

| Abschnitt | Was darin steht |
| --- | --- |
| `business` | Name, Telefonnummer, E-Mail, Einleitungstext, Zahlen für die Startseite |
| `locations` | Alle Standorte mit Adresse, Unterrichts- und Bürozeiten |
| `licenseGroups` | Alle Führerscheinklassen mit Beschreibung, Mindestalter und Preis |
| `pricing` | Kostenübersicht. Erst wenn `published: true` gesetzt ist, erscheint die Preistabelle |
| `steps` | Die Schritte auf dem Weg zum Führerschein |
| `team` | Fahrlehrerinnen und Fahrlehrer samt Fotos |
| `faq` | Häufige Fragen und Antworten |
| `theoryLessons` | Die Pflichtlektionen, die im Portal abgehakt werden |
| `specialDrives` | Vorgeschriebene Sonderfahrten und ihre Anzahl |
| `invoicing` | Umsatzsteuersatz, Zahlungsziel, Bankverbindung und Steuernummer für die Rechnungen |
| `legal` | Angaben für Impressum und Datenschutzerklärung |

**Logo:** Die Bilddatei nach `public/img/` legen und in `content.js` unter
`business.logo` eintragen, z. B. `logo: '/img/logo.png'`. PNG mit durchsichtigem
Hintergrund oder SVG funktioniert am besten; die Höhe passt die Seite selbst an.
Solange nichts eingetragen ist, zeigt die Seite ersatzweise ein Kästchen mit dem
Anfangsbuchstaben.

Drei Punkte dazu:

- Trägt das Logo den Schriftzug „Fahrschule Nusser" bereits selbst, bleibt
  `logoMitText` auf `false` – sonst stünde der Name doppelt da. Ist das Logo nur ein
  Bildzeichen, `logoMitText: true` setzen.
- In der Fußzeile steht das Logo auf dunklem Grund. Gibt es eine helle Fassung, diese
  unter `logoHell` eintragen. Ohne sie wird das normale Logo dort auf ein helles
  Plättchen gesetzt, damit es in jedem Fall lesbar bleibt.
- Für den Browser-Tab kann unter `favicon` ein quadratisches Bild ab 180 × 180 Pixeln
  hinterlegt werden.

**Fotos** gehören nach `public/img/` (Teamfotos zum Beispiel nach `public/img/team/`)
und werden in `content.js` mit ihrem Pfad eingetragen, etwa `photo: '/img/team/nusser.jpg'`.

**Dateien zum Herunterladen** (Merkblätter, Formulare) werden nach `public/uploads/`
gelegt und im Verwaltungsbereich unter „Unterlagen“ mit dem Pfad `/uploads/dateiname.pdf`
hinterlegt.

## E-Mail-Versand einrichten

Ohne Konfiguration verschickt die Anwendung **keine** E-Mails – Anmeldelinks und
Benachrichtigungen werden nur in der Konsole ausgegeben und in `data/outbox.log`
gesammelt. Zum Ausprobieren reicht das; für den Betrieb muss ein Versandweg eingerichtet
werden. Solange keiner eingerichtet ist, weist die Verwaltungsübersicht darauf hin.

### Weg A (empfohlen): Resend

Viele Hosting-Anbieter sperren ausgehende SMTP-Verbindungen, lassen HTTPS aber durch.
[Resend](https://resend.com) verschickt über eine HTTPS-Schnittstelle und funktioniert
deshalb auch dort zuverlässig.

1. Bei [resend.com](https://resend.com) registrieren (kostenlos, 100 E-Mails pro Tag)
2. Unter „Domains“ die eigene Domain eintragen und die angezeigten DNS-Einträge beim
   Domain-Anbieter hinterlegen
3. Unter „API Keys“ einen Schlüssel erzeugen
4. In `.env` eintragen:

```
RESEND_API_KEY=der-erzeugte-schluessel
RESEND_FROM="Fahrschule Nusser <no-reply@fahrschule-nusser.de>"
BASE_URL=https://www.fahrschule-nusser.de
```

Die Absenderadresse muss zu der bei Resend bestätigten Domain gehören, sonst lehnt
Resend den Versand ab.

### Weg B: klassisches SMTP

Funktioniert auf einem eigenen Server oder VPS. In `.env` `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS` und `SMTP_FROM` eintragen. Sind beide Wege konfiguriert,
wird Resend benutzt.

## Als Vorführung laufen lassen

Bevor die Seite echt in Betrieb geht, lässt sie sich mit Beispieldaten vorführen –
etwa, um sie der Fahrschule zu zeigen. Dafür gibt es zwei Zutaten.

### 1. Beispieldaten erzeugen

```bash
npm run demo
```

Das legt sechs Theorietermine (immer in der kommenden Woche, Montag bis Donnerstag),
vier Fahrschüler mit unterschiedlichem Ausbildungsstand, zwei offene Anfragen,
Mitteilungen und Unterlagen an. Alle Personen darin sind frei erfunden.

`npm run demo -- reset` löscht vorher alles und legt frisch an – praktisch, wenn in
einer Vorführung etwas durcheinandergeraten ist.

### 2. Den Vorführmodus einschalten

```bash
DEMO_MODE=true npm start
```

Damit ändern sich zwei Dinge:

- Auf der Anmeldeseite stehen **alle Zugänge zum Anklicken**, nach Rolle gruppiert:
  die Fahrschule, die Fahrlehrer und die Fahrschüler. Ohne das käme niemand ins Portal,
  denn der Anmeldelink wird sonst per E-Mail verschickt.
- Oben auf jeder Seite läuft ein Hinweisband, das klarstellt, dass es sich um eine
  Vorführung mit erfundenen Daten handelt.

> **Der Vorführmodus gehört niemals in den echten Betrieb.** Solange er an ist, kann
> jeder Besucher in jedes Konto – auch in die Verwaltung. Beim Start warnt der Server
> deshalb deutlich in der Konsole. Ist `DEMO_MODE` nicht gesetzt, existiert der
> Direktzugang schlicht nicht (die Adresse antwortet mit „Seite nicht gefunden“).

### Was sich gut vorführen lässt

1. **Öffentliche Seite** durchklicken – besonders am Handy, das ist der größte
   Unterschied zur alten Seite
2. **Als Fahrschülerin Lena Brinkmann anmelden:** Sie steht kurz vor der Prüfung, hat
   neun Lektionen besucht und eine Notiz ihres Fahrlehrers
3. **Einen Theorietermin buchen** und wieder absagen
4. **Als Fahrschule anmelden:** die offene Anmeldung von Sophie Klein mit einem Klick
   in einen Portalzugang umwandeln, danach ihren Ausbildungsstand pflegen
5. **Teilnehmerliste** eines Termins öffnen und ausdrucken
6. **Als Fahrlehrer anmelden** (Andrea Hartmann betreut den Hauptsitz, Tobias Kramer
   den Standort Elsen): unter „Theorietermine" einen neuen Termin festlegen und sehen,
   dass die Termine des anderen Standorts zwar sichtbar, aber nicht änderbar sind
7. Denselben Weg für die **Anwesenheit**: einen gehaltenen Termin öffnen und abhaken,
   wer da war – danach im Portal des Fahrschülers nachsehen, wie die Lektion erscheint
8. Unter „Aufnehmen" einen neuen Fahrschüler anlegen, wahlweise aus einer offenen
   Online-Anmeldung übernommen
9. Beim Fahrschüler eine Fahrstunde eintragen und eine Notiz hinterlassen
10. **Als Fahrschule eine Rechnung schreiben:** unter „Rechnungen“ einen Fahrschüler
   wählen; die offenen Fahrstunden stehen schon als Positionen bereit. Danach als
   Fahrschüler die fertige Rechnung ansehen und drucken

### Vorführung im Netz

Soll die Fahrschule selbst hineinschauen, ohne dass bei ihr etwas installiert wird,
läuft die Vorführung bei [Render](https://render.com) – **kostenlos**. Dass der
Datenbestand bei jedem Start zurückgesetzt wird, ist bei einer Vorführung ja gerade
erwünscht.

Hochladen musst du nichts: Der Code liegt bereits auf GitHub, Render holt ihn sich
von dort.

1. Bei [render.com](https://render.com) mit dem GitHub-Konto anmelden
2. „New“ → „Blueprint“, dieses Repository auswählen
3. **Als Branch `claude/fahrschulenusser-modernize-hhz1r9` angeben.** Das ist wichtig:
   Der Standard-Branch dieses Repositorys gehört zu einem anderen Projekt – ohne die
   Angabe würde Render das Falsche bauen.
4. Render liest die Datei [`render.yaml`](../render.yaml) im Wurzelverzeichnis und
   richtet alles ein. Die Vorführung ist dort schon fertig eingestellt: kostenloser
   Tarif, Vorführmodus an, Beispieldaten bei jedem Start.
5. Nach dem ersten Bauen vergibt Render eine Adresse, die auf `.onrender.com` endet.
   Diese unter „Environment“ als `BASE_URL` eintragen und einmal neu veröffentlichen.

Danach ist die Vorführung unter dieser Adresse erreichbar – der Link lässt sich
einfach weitergeben.

Zwei Eigenheiten des kostenlosen Tarifs: Der Dienst schläft nach etwa 15 Minuten
Leerlauf ein, der erste Aufruf danach dauert knapp eine Minute. Und bei jedem Start
werden die Beispieldaten neu angelegt – was in einer Vorführung eingetragen wurde,
ist danach wieder weg.

### Vom Vorführ- in den echten Betrieb

In `render.yaml` ist an jeder betroffenen Stelle vermerkt, was zu ändern ist. Kurz
gefasst:

| Was | Vorführung | Echter Betrieb |
| --- | --- | --- |
| `plan` | `free` | `starter` |
| `startCommand` | `npm run demo -- reset && npm start` | `npm start` |
| `DEMO_MODE` | `true` | Variable löschen |
| `disk` und `DATA_DIR` | auskommentiert | einkommentieren |

Dazu den E-Mail-Versand einrichten (siehe oben) und die Beispieldaten löschen.

## Die Seite veröffentlichen

Die Anwendung braucht einen laufenden Node.js-Prozess – ein Webspace, auf den man
nur Dateien hochlädt, reicht nicht aus.

### Das Wichtigste zuerst: die Daten müssen dauerhaft liegen

Fahrschüler, Theorietermine, Anmeldungen und Anfragen liegen als JSON-Dateien im
Ordner `data/`. Auf den meisten Hosting-Plattformen ist die Festplatte des Containers
**flüchtig**: Bei jeder neuen Veröffentlichung wird sie auf den Auslieferungszustand
zurückgesetzt – alle inzwischen angelegten Fahrschüler und Termine wären weg.

Deshalb gibt es die Umgebungsvariable `DATA_DIR`. Sie zeigt auf einen dauerhaften
Speicher außerhalb des Projektordners:

```
DATA_DIR=/var/data
```

Ohne die Variable wird wie bisher `data/` im Projekt benutzt – das ist für den
Betrieb auf dem eigenen Rechner richtig, im Livebetrieb aber nur dann, wenn der
Ordner auf einem dauerhaften Laufwerk liegt.

### Weg A: Render – am schnellsten eingerichtet

1. Bei [render.com](https://render.com) anmelden und das GitHub-Repository verbinden
2. „New" → „Blueprint" wählen und als Branch den Zweig mit dieser Anwendung angeben.
   Render liest die Datei [`render.yaml`](../render.yaml) im Wurzelverzeichnis des
   Repositorys – dort stehen auch die Stellen, die für den echten Betrieb von der
   Vorführung umgestellt werden müssen
3. Unter „Environment" noch eintragen:
   - `BASE_URL` – die echte Adresse, z. B. `https://www.fahrschule-nusser.de`
   - `SEED_ADMIN_EMAIL` – die E-Mail-Adresse des ersten Verwaltungszugangs
   - `RESEND_API_KEY` und `RESEND_FROM` – für den E-Mail-Versand (siehe oben)
4. Eigene Domain unter „Settings" → „Custom Domain" hinterlegen und die angezeigten
   DNS-Einträge beim Domain-Anbieter eintragen. Das HTTPS-Zertifikat richtet Render
   selbst ein.

**Der kostenlose Tarif reicht hier nicht:** Er bietet keine dauerhafte Festplatte, und
der Dienst schläft nach Leerlauf ein, sodass der erste Besucher lange wartet. Für den
echten Betrieb ist der „Starter"-Tarif plus Festplatte nötig (zusammen rund 8 US-Dollar
im Monat). Als Region ist in `render.yaml` Frankfurt eingestellt, damit die Daten in
der EU bleiben.

### Weg B: eigener kleiner Server – günstiger und datenschutzfreundlicher

Ein kleiner Server bei einem deutschen Anbieter (etwa Hetzner Cloud, ab knapp 4 Euro
im Monat) hat drei Vorteile: Die Daten liegen in Deutschland, der Vertrag zur
Auftragsverarbeitung ist auf Deutsch und unkompliziert, und ausgehende SMTP-Verbindungen
sind nicht gesperrt – es geht also auch ohne Resend.

Dafür muss der Server selbst gepflegt werden. Grober Ablauf:

1. Node.js installieren, Repository klonen, `npm install --omit=dev` ausführen
2. `.env` mit den echten Werten anlegen
3. Die Anwendung als Systemdienst einrichten, damit sie nach einem Neustart
   automatisch wieder läuft (`systemd`)
4. Einen Webserver davorsetzen (Caddy oder nginx), der HTTPS übernimmt – Caddy holt
   das Zertifikat automatisch
5. Eine tägliche Sicherung des Ordners `data/` einrichten

### Vor dem Livegang prüfen

- [ ] `BASE_URL` zeigt auf die echte Domain – sonst führen die Anmeldelinks in den
      E-Mails ins Leere
- [ ] `SESSION_SECRET` ist eine lange Zufallszeichenkette, nicht der Beispielwert
- [ ] `NODE_ENV=production` ist gesetzt, damit das Sitzungs-Cookie nur über HTTPS geht
- [ ] `DATA_DIR` zeigt auf dauerhaften Speicher
- [ ] E-Mail-Versand ist eingerichtet und wurde einmal echt getestet
      (Anmeldelink anfordern und die Mail wirklich empfangen)
- [ ] Eine regelmäßige Sicherung des Datenordners läuft
- [ ] Impressum und Datenschutzerklärung sind vollständig
- [ ] Mit dem Hosting-Anbieter und dem E-Mail-Dienstleister ist jeweils ein Vertrag
      zur Auftragsverarbeitung geschlossen und in der Datenschutzerklärung genannt

Der letzte Punkt ist kein Formalkram: Im Portal stehen Namen, Kontaktdaten und
Ausbildungsstände von Fahrschülern, von denen viele minderjährig sind.

## Was noch fehlt

Diese Punkte müssen vor dem Livegang von der Fahrschule geklärt und in
`src/content.js` eingetragen werden:

- [ ] **Preise** – alle Beträge, danach `pricing.published` auf `true` setzen
- [ ] **E-Mail-Adresse** der Fahrschule (steht aktuell als Platzhalter drin)
- [ ] **Team** – Namen, Funktionen, Ausbildungsklassen und Fotos
- [ ] **Bürozeiten** und die Unterrichtszeiten der vier Zweigstellen
- [ ] **Standort „Lange Straße“** – Postleitzahl und Ort prüfen
- [ ] **Impressum** – Umsatzsteuer-Nummer, Aufsichtsbehörde, verantwortliche Person
- [ ] **Datenschutzerklärung** – Hosting-Anbieter und E-Mail-Dienstleister ergänzen,
      anschließend fachkundig prüfen lassen
- [ ] **Fotos** von Fahrzeugen, Unterrichtsräumen und Standorten
- [ ] **Rechnungsangaben** unter `invoicing`: Steuernummer, Bankverbindung, IBAN und BIC.
      Ohne sie fehlen auf den Rechnungen Pflichtangaben nach § 14 UStG
- [ ] **Logo** der bisherigen Website unter `business.logo`

Die vorhandenen Adressen, die Telefonnummer und die Führerscheinklassen stammen aus
öffentlichen Branchenverzeichnissen und sollten einmal gegengelesen werden.

## Technisches

- **Node.js und Express** mit **EJS** als Vorlagensprache – serverseitig gerendertes
  HTML, das ohne JavaScript im Browser auskommt. Das ist schnell und wird von
  Suchmaschinen gut gelesen.
- **Daten in JSON-Dateien** unter `data/` – keine Datenbank nötig. Für eine Fahrschule
  dieser Größe völlig ausreichend; wächst der Bedarf, wird nur `src/db.js` ausgetauscht.
- **Keine fremden Schriftarten oder Skripte.** Alles wird vom eigenen Server geladen.
  Das ist schnell und vermeidet das Nachladen von Google-Servern, das in Deutschland
  datenschutzrechtlich abgemahnt wurde.
- **Kein Tracking, keine Werbe-Cookies.** Gesetzt wird nur ein technisch notwendiges
  Sitzungs-Cookie nach der Anmeldung – dafür braucht es kein Einwilligungsbanner.
- **Barrierearm:** Sprungmarke zum Inhalt, sichtbare Fokusrahmen, beschriftete
  Formularfelder, ausreichende Farbkontraste.
- **Kein seitliches Scrollen.** Grid- und Flex-Container haben von Haus aus
  `min-width: auto` und schrumpfen deshalb nie unter die Inhaltsbreite ihrer Kinder:
  Ein Eingabefeld bringt rund 20 Zeichen Mindestbreite mit, eine Tabelle ihre volle
  Spaltenbreite – beides bläht sonst die ganze Seite auf, statt umzubrechen oder im
  eigenen Rahmen zu scrollen. Deshalb steht in `portal.css` eine Grundregel, die
  `min-width: 0` auf allen inhaltstragenden Containern setzt. Wer neue Ansichten
  baut, sollte sie dort eintragen.
- **Fürs Handy gebaut, nicht nur verkleinert.** Fahrschüler öffnen ihren Bereich fast
  immer am Telefon. Dort ersetzt eine feste Leiste am unteren Rand die Seitenleiste:
  mit dem Daumen erreichbar, und alle Bereiche sind auf einen Blick sichtbar statt
  hinter seitlichem Wischen versteckt. Was nicht in die vier Reiter passt, sammelt
  „Mehr“. Beide Darstellungen stammen aus derselben Datei ([`src/navigation.js`](src/navigation.js)),
  können also nicht auseinanderlaufen.

### Aufbau

```
fahrschule-nusser/
├── src/
│   ├── server.js      Startet den Server
│   ├── app.js         Express-Einrichtung, Sitzungen, Routen
│   ├── content.js     ALLE INHALTE – hier wird redigiert
│   ├── db.js          Datenhaltung in JSON-Dateien
│   ├── progress.js    Rechnet den Ausbildungsstand in Prozentwerte um
│   ├── format.js      Datums- und Währungsformate
│   ├── navigation.js  Portalnavigation je Rolle (Seitenleiste und Handy-Reiter)
│   ├── mailer.js      E-Mail-Versand (Resend, SMTP oder Protokoll)
│   ├── middleware/    Anmeldung und Zugriffsschutz
│   └── routes/        site (öffentlich), auth, portal, instructor, admin
├── views/
│   ├── partials/      Kopfzeile, Fußzeile, Portalnavigation
│   ├── site/          Öffentliche Seiten
│   ├── portal/        Fahrschüler-Portal und Rechnungsblatt
│   ├── instructor/    Fahrlehrer-Bereich (Standort, Termine, Anwesenheit)
│   └── admin/         Verwaltung
├── public/
│   ├── css/           site.css (Design-System) und portal.css
│   ├── js/            Menü und Platzhalter-Hervorhebung
│   ├── img/           Bilder
│   └── uploads/       Dateien zum Herunterladen
└── data/              JSON-Dateien (nicht im Repository)
```

### Farben und Schrift anpassen

Sämtliche Farben, Abstände und Rundungen stehen als Variablen ganz oben in
`public/css/site.css` im Block `:root`. Wer das Erscheinungsbild ändern will, ändert
in der Regel nur diese Werte.

### Datensicherung

Alle Daten liegen im Ordner `data/`. Für eine Sicherung genügt es, diesen Ordner
regelmäßig zu kopieren. Er ist bewusst nicht Teil des Repositorys, damit keine
personenbezogenen Daten von Fahrschülern versehentlich veröffentlicht werden.
