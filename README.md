# Hochzeits-Verleih – Website (Firmenname noch offen)

Eine stilvolle, responsive Website für einen Hochzeits-Verleih (Tische, Stühle, Dekoration). Reines HTML/CSS/JavaScript – kein Build-Prozess nötig.

## Lokal ansehen

Einfach `index.html` im Browser öffnen, oder z. B. mit:

```bash
python3 -m http.server 8000
```

und dann `http://localhost:8000` aufrufen.

## Struktur

- `index.html` – gesamte Seite (Home, Leistungen, Galerie, Über uns, Kundenstimmen, Kontakt)
- `css/style.css` – Design (Farben, Layout, Responsive-Verhalten)
- `js/script.js` – mobiles Menü, Formular-Verhalten

## Vor dem Live-Gang bitte anpassen

Firmenname und Kontaktdaten waren zum Zeitpunkt der Erstellung noch nicht bekannt. Alle Stellen, die noch ausgefüllt werden müssen, sind in `index.html` als **eckige Platzhalter** markiert – am einfachsten findet man sie per Suche (Strg+F / Cmd+F) nach `[`:

1. **`[FIRMENNAME]`** – kommt im `<title>`, im Logo (Header) und im Footer vor. An allen Stellen durch den echten Firmennamen ersetzen (Suchen & Ersetzen über die ganze Datei).
2. **`[TELEFONNUMMER]`** – im Header und im Kontaktbereich. Beide `tel:`-Links (Format z. B. `+491234567890`) sowie den angezeigten Text ersetzen.
3. **`[E-MAIL-ADRESSE]`** – im Kontaktbereich, sowohl im `mailto:`-Link als auch im angezeigten Text.
4. **`[STRASSE HAUSNUMMER, PLZ ORT]`** und **`[ÖFFNUNGSZEITEN / ERREICHBARKEIT]`** – im Kontaktbereich.
5. **Social-Media-Links**: Die `#`-Platzhalter-Links (Instagram/Facebook) im Kontaktbereich durch echte Profile ersetzen (mit `<!-- TODO -->`-Kommentar markiert).
6. **Echte Fotos**: Der Galerie-Bereich (`#galerie`) nutzt aktuell farbige Platzhalter statt echter Fotos. Sobald Bilder vorhanden sind, `.gallery-item` durch `<img>`-Elemente ersetzen.
7. **Kundenstimmen**: Der Abschnitt „Kundenstimmen" enthält Platzhaltertexte – bitte durch echte, freigegebene Zitate zufriedener Kundinnen und Kunden ersetzen.
8. **Kontaktformular funktionsfähig machen**: Das Formular sendet aktuell keine Daten – es zeigt nur eine Bestätigung an. Um Anfragen wirklich zu empfangen, an einen Formular-/E-Mail-Dienst anbinden (z. B. Formspree, Netlify Forms) oder ein eigenes Backend anbinden. Die Logik dafür steht in `js/script.js`.
9. **Karte/Anfahrt** (optional): Ein Google-Maps-Iframe mit der echten Adresse kann im Kontakt-Bereich ergänzt werden.

## Hosting

Da es sich um eine statische Seite handelt, kann sie z. B. über GitHub Pages, Netlify oder Vercel kostenlos gehostet werden.
