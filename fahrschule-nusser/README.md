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

### Fahrschüler-Portal

- **Anmeldung ohne Passwort:** E-Mail-Adresse eingeben, Link per Mail bekommen, fertig.
  Der Link gilt 30 Minuten und funktioniert nur einmal.
- **Übersicht:** Ausbildungsstand auf einen Blick, nächste Termine, Mitteilungen, Unterlagen.
- **Theorietermine:** alle kommenden Termine mit Anmeldung und Abmeldung per Klick,
  inklusive Platzbegrenzung. Bereits besuchte Lektionen sind markiert.
- **Fortschritt:** besuchte Pflichtlektionen, Übungsstunden, Sonderfahrten je Art,
  Prüfungsstand und eine persönliche Notiz des Fahrlehrers.
- **Unterlagen:** Dokumente, die für alle oder gezielt für eine Person hinterlegt sind.
- **Meine Daten:** eigene Kontaktdaten pflegen.

### Verwaltung (für die Fahrschule)

- **Übersicht:** offene Anfragen, Anzahl Fahrschüler, nächste Termine und wer
  kurz vor der praktischen Prüfung steht.
- **Anfragen:** alle Kontaktanfragen und Online-Anmeldungen. Eine Anmeldung lässt sich
  mit einem Klick in einen Portalzugang umwandeln – die Begrüßungsmail geht automatisch raus.
- **Fahrschüler:** anlegen, Stammdaten pflegen und den kompletten Ausbildungsstand
  eintragen (Lektionen abhaken, Fahrstunden, Sonderfahrten, Prüfungsstatus, Notiz).
- **Theorietermine:** Termine anlegen und ändern, Teilnehmerlisten ansehen und ausdrucken.
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
| `legal` | Angaben für Impressum und Datenschutzerklärung |

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
│   ├── mailer.js      E-Mail-Versand (Resend, SMTP oder Protokoll)
│   ├── middleware/    Anmeldung und Zugriffsschutz
│   └── routes/        site (öffentlich), auth, portal, admin
├── views/
│   ├── partials/      Kopfzeile, Fußzeile, Portalnavigation
│   ├── site/          Öffentliche Seiten
│   ├── portal/        Fahrschüler-Portal
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
