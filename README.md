# Hochzeitsträume Verleih – Website

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

1. **Name & Kontaktdaten**: Firmenname "Hochzeitsträume Verleih" ist ein Platzhalter – in `index.html` (Logo, Footer) und ggf. im `<title>` durch den echten Namen ersetzen. Adresse, Telefonnummer und E-Mail im Abschnitt „Kontakt" sowie im Header aktualisieren.
2. **Echte Fotos**: Der Galerie-Bereich (`#galerie`) nutzt aktuell farbige Platzhalter statt echter Fotos. Sobald Bilder vorhanden sind, `.gallery-item` durch `<img>`-Elemente ersetzen.
3. **Kundenstimmen**: Der Abschnitt „Kundenstimmen" enthält Platzhaltertexte – bitte durch echte, freigegebene Zitate zufriedener Kundinnen und Kunden ersetzen.
4. **Kontaktformular funktionsfähig machen**: Das Formular sendet aktuell keine Daten – es zeigt nur eine Bestätigung an. Um Anfragen wirklich zu empfangen, an einen Formular-/E-Mail-Dienst anbinden (z. B. Formspree, Netlify Forms) oder ein eigenes Backend anbinden. Die Logik dafür steht in `js/script.js`.
5. **Karte/Anfahrt** (optional): Ein Google-Maps-Iframe mit der echten Adresse kann im Kontakt-Bereich ergänzt werden.
6. **Social-Media-Links**: Platzhalter-Links (`#`) im Kontaktbereich und Footer durch echte Profile ersetzen.

## Hosting

Da es sich um eine statische Seite handelt, kann sie z. B. über GitHub Pages, Netlify oder Vercel kostenlos gehostet werden.
