# Wedding & Event Rental Website (Firmenname noch offen)

Eine Node.js/Express-Webanwendung für einen Verleih (Schwerpunkt Hochzeiten, aber auch für andere Events/Feiern nutzbar): eine öffentliche Website mit interaktivem Katalog (Tische, Stühle, Deko, Geschirr ...) auf Englisch, plus einen passwortlosen Admin-Bereich zur Katalogpflege, Bestellfreigabe und Admin-Übergabe.

Das ist **kein statisches HTML mehr** wie die erste Version, sondern eine echte Anwendung mit Server, Login und E-Mail-Versand.

## Was die Seite kann

- **Öffentliche Seite (Englisch)**: Startseite, Katalog mit Mengen-Auswahl (+/-), allgemeines Kontaktformular. Fokus liegt auf Hochzeiten, es gibt aber überall ein „Event type"-Feld (Wedding, Birthday, Corporate Event, ...), sodass die Seite auch für andere Veranstaltungen genutzt werden kann.
- **Katalog-Anfrage**: Kunden wählen Stückzahlen aus, klicken „Send Request", wählen Event-Typ und tragen Name/E-Mail/Wunschdatum ein. Die Anfrage wird gespeichert (Status „pending") und per E-Mail an den aktuellen Admin geschickt.
- **Bestellfreigabe**: Anfragen sind erst „Pending". Erst wenn der Admin im Dashboard auf „Confirm" klickt, geht automatisch eine Bestätigungsmail an den Kunden raus (inkl. Artikelliste und Gesamtbetrag) - vorher passiert nichts.
- **Reinigungs- &amp; Lieferungspauschale**: Im Admin-Bereich unter „Fees" einstellbar. Wird automatisch einmal pro Bestellung zum Warenkorb-Gesamtbetrag addiert (nicht pro Artikel), sowohl in der Anfrage-Mail als auch auf der Danke-Seite und in der Bestätigungsmail.
- **Admin-Login ohne Passwort**: Man gibt seine E-Mail-Adresse ein und bekommt einen Login-Link per Mail (gültig 30 Minuten).
- **Admin-Bereich**: Katalogartikel anlegen/bearbeiten/löschen (Name, Kategorie, Maße, Beschreibung, Preis, Preiseinheit, Stückzahl, **echtes Foto-Upload**), alle eingegangenen Anfragen einsehen und freigeben, Gebühren einstellen.
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

Ohne Konfiguration werden Login-Links und Anfrage-Benachrichtigungen **nicht wirklich verschickt**, sondern nur in `data/outbox.log` protokolliert und in der Konsole ausgegeben. So lässt sich alles lokal testen, aber für den echten Betrieb muss ein E-Mail-Anbieter eingetragen werden. Solange keiner konfiguriert ist, zeigt das Admin-Dashboard einen Warnhinweis.

### Option A (empfohlen): Resend

Viele Hosting-Plattformen (Render's kostenloser Tarif eingeschlossen) blockieren ausgehende SMTP-Verbindungen (Port 25/465/587), lassen aber ganz normales HTTPS zu. [Resend](https://resend.com) verschickt E-Mails über eine HTTP-API statt über SMTP und funktioniert deshalb auch dort zuverlässig, wo klassisches SMTP hängen bleibt oder mit „Connection timeout" fehlschlägt (genau das Problem, das wir beim Testen auf Render hatten).

1. Bei [resend.com](https://resend.com) registrieren (kostenlos, 100 E-Mails/Tag)
2. Unter „Domains" → „Add Domain" die eigene Domain eintragen (z. B. `hv-manager.de`) und die angezeigten DNS-Einträge beim Domain-Anbieter (z. B. Strato) hinzufügen
3. Unter „API Keys" einen neuen Key erstellen
4. In `.env` bzw. bei Render unter „Environment" setzen:

```
RESEND_API_KEY=dein-api-key
RESEND_FROM="[COMPANY NAME] <no-reply@hv-manager.de>"
BASE_URL=https://deine-echte-domain.de
```

Die Absenderadresse in `RESEND_FROM` muss zu einer bei Resend verifizierten Domain gehören (Schritt 2), sonst lehnt Resend den Versand ab.

### Option B: klassisches SMTP

Funktioniert gut, wenn die App später auf einem eigenen Server/VPS läuft (dort ist SMTP normalerweise nicht blockiert). Auf reinem PaaS-Hosting wie Render kann es wie beschrieben an blockierten Ports scheitern.

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=deine-adresse@gmail.com
SMTP_PASS=dein-app-passwort
SMTP_FROM="Wedding Rentals <no-reply@example.com>"
```

Funktioniert mit jedem SMTP-fähigen Anbieter (Gmail mit „App-Passwort", oder Diensten wie SendGrid, Postmark, Mailgun). Sind sowohl `RESEND_API_KEY` als auch SMTP-Werte gesetzt, wird Resend bevorzugt.

`BASE_URL` unbedingt auf die echte Domain setzen, sobald die Seite live ist - sonst zeigen die Links in den E-Mails auf `localhost`.

## Vor dem Live-Gang noch anzupassen

Genau wie schon bei der ersten Version stehen Firmenname und Kontaktdaten als Platzhalter in eckigen Klammern in den Dateien unter `views/`:

- `[COMPANY NAME]` - in `views/partials/header.ejs`, `views/partials/footer.ejs`, `views/partials/head.ejs`, `views/home.ejs`, `views/admin/*.ejs`
- `[PHONE NUMBER]`, `[EMAIL ADDRESS]`, `[STREET ADDRESS, CITY, STATE ZIP]`, `[BUSINESS HOURS]` - in `views/partials/header.ejs` und `views/home.ejs`

Am einfachsten per Suchen & Ersetzen über den ganzen `views/`-Ordner.

Weitere Punkte:
- **Fotos**: Im Admin-Bereich kann bei jedem Artikel jetzt eine echte Bilddatei hochgeladen werden (JPG/PNG/GIF/WebP, bis 5 MB) - landet unter `public/uploads/`. Alternativ geht weiterhin auch eine externe Bild-URL. Ohne Foto zeigt die Karte einen farbigen Platzhalter mit Kategorienamen.
- **Startadmin ändern**: Falls die Seite nicht mit `eugenkromer@hv-manager.de`, sondern direkt mit einer anderen E-Mail starten soll, `SEED_ADMIN_EMAIL` in `.env` setzen, bevor der Server zum ersten Mal läuft (danach lässt sich die Rolle nur noch über die Übergabe-Funktion im Admin-Bereich ändern).
- **Session-Secret**: `SESSION_SECRET` in `.env` auf einen zufälligen, langen Wert setzen (Befehl dafür steht in `.env.example`).

## Hosting

Diese App braucht - anders als die erste, rein statische Version - einen laufenden Node.js-Prozess (kein reines "ZIP hochladen" mehr möglich). Geeignet sind z. B. Render, Railway, Fly.io oder ein eigener kleiner Server/VPS.

### Wichtig: Datenspeicherung ist standardmäßig NICHT dauerhaft

Katalog, Anfragen, Nutzer und hochgeladene Fotos liegen als Dateien im Container (`data/` und `public/uploads/`). Auf den meisten Hosting-Plattformen - **Render's kostenloser Tarif eingeschlossen** - ist die Festplatte des Containers **flüchtig ("ephemeral")**: Bei jedem neuen Deploy (z. B. jedes Mal, wenn wir einen Fix pushen) und teilweise auch bei einem Neustart wird sie auf den Build-Zustand zurückgesetzt. Das bedeutet: **neu angelegte Katalogartikel, hochgeladene Fotos und eingegangene Anfragen können beim nächsten Deploy verloren gehen**, wenn kein persistenter Speicher eingerichtet ist.

Für den echten Dauerbetrieb (nicht nur zum Testen) unbedingt einrichten:
- Bei Render: einen **„Disk"** (persistentes Volume) am Service anhängen und auf `/app/data` bzw. den entsprechenden Pfad mounten (kostenpflichtig, aber günstig) - siehe [Render Disks Doku](https://render.com/docs/disks)
- Oder: mittelfristig auf eine echte Datenbank umstellen (z. B. Render's Postgres) statt der JSON-Dateien

Bis dahin: nach jedem Redeploy im Admin-Bereich kurz prüfen, ob Katalog/Fotos noch da sind, und ggf. neu anlegen.

Weitere Punkte beim Deployment:
- `.env` mit echten Werten anlegen (nicht ins Git-Repo committen)

## Projektstruktur

```
src/
  app.js            Express-Setup, Middleware, Routen
  server.js         Startpunkt
  db.js             Datenschicht (JSON-Dateien unter /data)
  mailer.js         E-Mail-Versand (mit Konsole/Datei-Fallback)
  upload.js         Foto-Upload-Handling (multer)
  middleware/auth.js
  routes/
    site.js         Startseite, Katalog, Anfragen/Kontakt
    auth.js         Login per Magic Link
    admin.js        Dashboard, Katalogpflege, Bestellfreigabe, Gebühren, Admin-Übergabe
views/              EJS-Templates (öffentliche Seite + Admin)
public/             CSS & Client-JavaScript
public/uploads/     Hochgeladene Katalogfotos, nicht im Git (siehe Hinweis zu flüchtigem Speicher oben)
data/               Laufzeitdaten (JSON), nicht im Git
```
