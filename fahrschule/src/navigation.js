// Die Navigation des Portals an einer Stelle. Daraus entstehen zwei
// Darstellungen: die Seitenleiste am Rechner und die Leiste am unteren
// Bildschirmrand auf dem Handy. So kann beides nicht auseinanderlaufen.
//
// Die ersten vier Einträge sind die Reiter auf dem Handy, alles Weitere
// sammelt sich hinter "Mehr" - deshalb stehen die häufigsten Wege oben.

// Schlichte Symbole für die Leiste auf dem Handy. Bewusst als Pfade und
// nicht als Emoji: Emoji sehen auf jedem Gerät anders aus.
const symbole = {
  haus: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  kalender: 'M7 3v3M17 3v3M3.5 9h17M4.5 5.5h15v15h-15z',
  stufen: 'M4 20V9M12 20V4M20 20v-7',
  beleg: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
  ordner: 'M4 6h5l2 2h9v11H4zM4 6v13',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0',
  gruppe: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20a6.5 6.5 0 0 1 13 0M17 8.5a2.5 2.5 0 1 0 0-5M18 20h3.5a5 5 0 0 0-3-4.6',
  plus: 'M12 5v14M5 12h14',
  mehr: 'M5 12h.01M12 12h.01M19 12h.01',
};

function eintraege(user) {
  if (!user) return [];

  if (user.role === 'student') {
    return [
      { href: '/portal', label: 'Übersicht', kurz: 'Start', symbol: 'haus', exakt: true },
      { href: '/portal/theorie', label: 'Theorietermine', kurz: 'Termine', symbol: 'kalender' },
      { href: '/portal/fortschritt', label: 'Mein Fortschritt', kurz: 'Fortschritt', symbol: 'stufen' },
      { href: '/portal/rechnungen', label: 'Rechnungen', kurz: 'Rechnungen', symbol: 'beleg' },
      { href: '/portal/dokumente', label: 'Unterlagen', kurz: 'Unterlagen', symbol: 'ordner' },
      { href: '/portal/profil', label: 'Meine Daten', kurz: 'Daten', symbol: 'person' },
    ];
  }

  if (user.role === 'instructor') {
    return [
      { href: '/portal/fahrlehrer', label: 'Meine Fahrschüler', kurz: 'Schüler', symbol: 'gruppe', exakt: true },
      { href: '/portal/fahrlehrer/theorie', label: 'Theorietermine', kurz: 'Termine', symbol: 'kalender' },
      { href: '/portal/fahrlehrer/aufnehmen', label: 'Aufnehmen', kurz: 'Aufnehmen', symbol: 'plus', exakt: true },
      { href: '/portal/profil', label: 'Meine Daten', kurz: 'Daten', symbol: 'person' },
    ];
  }

  // Fahrschule (Büro)
  return [
    { href: '/portal/verwaltung', label: 'Übersicht', kurz: 'Start', symbol: 'haus', exakt: true },
    { href: '/portal/verwaltung/fahrschueler', label: 'Fahrschüler', kurz: 'Schüler', symbol: 'gruppe' },
    { href: '/portal/verwaltung/anfragen', label: 'Anfragen', kurz: 'Anfragen', symbol: 'beleg' },
    { href: '/portal/verwaltung/rechnungen', label: 'Rechnungen', kurz: 'Rechnungen', symbol: 'beleg' },
    { href: '/portal/verwaltung/fahrlehrer', label: 'Fahrlehrer', kurz: 'Fahrlehrer', symbol: 'person' },
    { href: '/portal/verwaltung/theorie', label: 'Theorietermine', kurz: 'Termine', symbol: 'kalender' },
    { href: '/portal/fahrlehrer/theorie', label: 'Anwesenheit und Fahrstunden', kurz: 'Anwesenheit', symbol: 'kalender' },
    { href: '/portal/verwaltung/dokumente', label: 'Unterlagen', kurz: 'Unterlagen', symbol: 'ordner' },
    { href: '/portal/verwaltung/mitteilungen', label: 'Mitteilungen', kurz: 'Mitteilungen', symbol: 'beleg' },
  ];
}

// Ist dieser Eintrag gerade der aktive? "exakt" für Einträge, deren Adresse
// der Anfang anderer Adressen ist.
function istAktiv(eintrag, pfad) {
  return eintrag.exakt ? pfad === eintrag.href : pfad.startsWith(eintrag.href);
}

// Auf dem Handy: die ersten vier als Reiter, der Rest hinter "Mehr".
const REITER = 4;

function reiter(user) {
  return eintraege(user).slice(0, REITER);
}

function weitere(user) {
  return eintraege(user).slice(REITER);
}

module.exports = { eintraege, reiter, weitere, istAktiv, symbole };
