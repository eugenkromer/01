# Wedding Rental Website (Firmenname noch offen)

Eine Node.js/Express-Webanwendung für einen Hochzeits-Verleih: eine öffentliche Website mit interaktivem Katalog (Tische, Stühle, Deko, Geschirr ...) auf Englisch, plus einen passwortlosen Admin-Bereich zur Katalogpflege, Anfragenübersicht und Admin-Übergabe.

Das ist **kein statisches HTML mehr** wie die erste Version, sondern eine echte Anwendung mit Server, Login und E-Mail-Versand.

## Was die Seite kann

- **Öffentliche Seite (Englisch)**: Startseite, Katalog mit Mengen-Auswahl (+/-), allgemeines Kontaktformular.
- **Katalog-Anfrage**: Kunden wählen Stückzahlen aus, klicken „Send Request", tragen Name/E-Mail/Wunschdatum ein. Die Anfrage wird gespeichert und per E-Mail an den aktuellen Admin geschickt.
- **Admin-Login ohne Passwort**: Man gibt seine E-Mail-Adresse ein und bekommt einen Login-Link per Mail (gültig 30 Minuten).
- **Admin-Bereich**: Katalogartikel anlegen/bearbeiten/löschen (Name, Kategorie, Maße, Beschreibung, Preis, Preiseinheit, Stückzahl, optionales Foto), alle eingegangenen Anfragen einsehen.
- **Admin-Übergabe**: Der aktuelle Admin trägt die E-Mail-Adresse der nächsten Person ein und bestätigt. Diese Person bekommt eine E-Mail mit einem Bestätigungslink, muss die Kontrolle aktiv annehmen - erst dann wechseln die Adminrechte. Der bisherige Admin behält danach **Lesezugriff** (sieht Katalog & Anfragen, kann aber nichts mehr ändern und bekommt keine Anfrage-Mails mehr).
- Aktuell voreingetragener Admin: **eugenkromer@hv-manager.de**

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) (Version 18 oder neuer).

```bash
npm install
cp .env.example .env
npm start
```

Dann `http://localhost:3000` im Browser öffnen. Für automatischen Neustart bei Änderungen: `npm run dev`.

Beim ersten Start werden automatisch angelegt:
- ein Admin-Konto mit der E-Mail aus `.env` (`SEED_ADMIN_EMAIL`, Standard: `eugenkromer@hv-manager.de`)
- ein paar Beispiel-Katalogartikel (Tische, Stühle, Besteck, Deko) zum Ausprobieren - im Admin-Bereich einfach löschen/anpassen

Alle Daten liegen in JSON-Dateien im Ordner `data/` (keine Datenbank nötig). Dieser Ordner ist in `.gitignore` und wird nicht mit committet.

## E-Mail-Versand einrichten (wichtig!)

Ohne Konfiguration werden Login-Links und Anfrage-Benachrichtigungen **nicht wirklich verschickt**, sondern nur in `data/outbox.log` protokolliert und in der Konsole ausgegeben. So lässt sich alles lokal testen, aber für den echten Betrieb muss ein E-Mail-Anbieter eingetragen werden.

In `.env` folgende Werte setzen (siehe `.env.example` für Details):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=deine-adresse@gmail.com
SMTP_PASS=dein-app-passwort
SMTP_FROM="Wedding Rentals <no-reply@example.com>"
BASE_URL=https://deine-echte-domain.de
```

Funktioniert mit jedem SMTP-fähigen Anbieter (Gmail mit „App-Passwort", oder Dienste wie Resend, SendGrid, Postmark, Mailgun). Solange `SMTP_HOST`, `SMTP_USER` und `SMTP_PASS` nicht gesetzt sind, zeigt das Admin-Dashboard einen Warnhinweis.

`BASE_URL` unbedingt auf die echte Domain setzen, sobald die Seite live ist - sonst zeigen die Links in den E-Mails auf `localhost`.

## Vor dem Live-Gang noch anzupassen

Genau wie schon bei der ersten Version stehen Firmenname und Kontaktdaten als Platzhalter in eckigen Klammern in den Dateien unter `views/`:

- `[COMPANY NAME]` - in `views/partials/header.ejs`, `views/partials/footer.ejs`, `views/partials/head.ejs`, `views/home.ejs`, `views/admin/*.ejs`
- `[PHONE NUMBER]`, `[EMAIL ADDRESS]`, `[STREET ADDRESS, CITY, STATE ZIP]`, `[BUSINESS HOURS]` - in `views/partials/header.ejs` und `views/home.ejs`

Am einfachsten per Suchen & Ersetzen über den ganzen `views/`-Ordner.

Weitere Punkte:
- **Fotos**: Im Admin-Bereich kann bei jedem Artikel eine Bild-URL hinterlegt werden. Ohne Foto zeigt die Karte einen farbigen Platzhalter mit Kategorienamen.
- **Startadmin ändern**: Falls die Seite nicht mit `eugenkromer@hv-manager.de`, sondern direkt mit einer anderen E-Mail starten soll, `SEED_ADMIN_EMAIL` in `.env` setzen, bevor der Server zum ersten Mal läuft (danach lässt sich die Rolle nur noch über die Übergabe-Funktion im Admin-Bereich ändern).
- **Session-Secret**: `SESSION_SECRET` in `.env` auf einen zufälligen, langen Wert setzen (Befehl dafür steht in `.env.example`).

## Hosting

Diese App braucht - anders als die erste, rein statische Version - einen laufenden Node.js-Prozess (kein reines "ZIP hochladen" mehr möglich). Geeignet sind z. B. Render, Railway, Fly.io oder ein eigener kleiner Server/VPS. Wichtig beim Deployment:
- `.env` mit echten Werten anlegen (nicht ins Git-Repo committen)
- `data/`-Ordner muss beschreibbar sein und sollte bei Neustarts/Deployments erhalten bleiben (persistentes Volume), sonst gehen Katalog und Anfragen-Historie verloren

## Projektstruktur

```
src/
  app.js            Express-Setup, Middleware, Routen
  server.js         Startpunkt
  db.js             Datenschicht (JSON-Dateien unter /data)
  mailer.js         E-Mail-Versand (mit Konsole/Datei-Fallback)
  middleware/auth.js
  routes/
    site.js         Startseite, Katalog, Anfragen/Kontakt
    auth.js         Login per Magic Link
    admin.js        Dashboard, Katalogpflege, Admin-Übergabe
views/              EJS-Templates (öffentliche Seite + Admin)
public/             CSS & Client-JavaScript
data/               Laufzeitdaten (JSON), nicht im Git
```
