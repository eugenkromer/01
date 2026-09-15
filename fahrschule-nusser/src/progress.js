// Rechnet den Ausbildungsstand eines Fahrschülers in Prozentwerte um,
// die sich direkt als Fortschrittsbalken anzeigen lassen. Wird sowohl im
// Fahrschüler-Portal als auch im Verwaltungsbereich benutzt.

const content = require('./content');
const db = require('./db');

function prozent(ist, soll) {
  if (!soll) return 0;
  return Math.min(100, Math.round((ist / soll) * 100));
}

function berechne(student) {
  const progress = student && student.progress ? student.progress : {};
  const theoryDone = Array.isArray(progress.theoryDone) ? progress.theoryDone : [];
  // Übertrag für Fahrschüler, die schon vor der Einführung des Portals
  // Stunden gefahren haben. Alles Neue kommt aus den Einträgen der
  // Fahrlehrer.
  const uebertragSpecial = progress.special || {};
  const uebertragUebung = Number(progress.drivingLessons) || 0;

  const fahrstunden = student && student.id ? db.getLessonsForStudent(student.id) : [];
  const einheiten = (art) => fahrstunden
    .filter((l) => l.type === art)
    .reduce((summe, l) => summe + (Number(l.units) || 0), 0);

  // Besuchte Lektionen: der Übertrag aus der Zeit vor dem Portal plus
  // alles, was über die Anwesenheitslisten der Theorietermine erfasst
  // wurde. Genau wie bei den Fahrstunden trägt niemand das von Hand pro
  // Person nach.
  const ausAnwesenheit = student && student.id ? db.getAttendedLessons(student.id) : [];
  const besucht = [...new Set([...theoryDone, ...ausAnwesenheit])].sort((a, b) => a - b);

  const theorieSoll = content.theoryLessons.length;
  const theorieIst = besucht.length;

  const sonderfahrten = content.specialDrives.map((fahrt) => {
    const ist = (Number(uebertragSpecial[fahrt.id]) || 0) + einheiten(fahrt.id);
    return {
      ...fahrt,
      ist,
      offen: Math.max(0, fahrt.required - ist),
      prozent: prozent(ist, fahrt.required),
      fertig: ist >= fahrt.required,
    };
  });

  const sonderSoll = sonderfahrten.reduce((summe, f) => summe + f.required, 0);
  // Mehr Fahrten als vorgeschrieben zählen für den Gesamtstand nicht doppelt.
  const sonderIst = sonderfahrten.reduce((summe, f) => summe + Math.min(f.ist, f.required), 0);

  return {
    theorie: {
      ist: theorieIst,
      soll: theorieSoll,
      prozent: prozent(theorieIst, theorieSoll),
      fertig: theorieIst >= theorieSoll,
      besucht,
      // Nur der Übertrag - das Büro pflegt ihn, alles andere kommt aus
      // den Anwesenheitslisten.
      uebertrag: theoryDone,
    },
    sonderfahrten,
    sonderGesamt: {
      ist: sonderIst,
      soll: sonderSoll,
      prozent: prozent(sonderIst, sonderSoll),
      fertig: sonderIst >= sonderSoll,
    },
    // Übungsstunden gesamt: Übertrag plus eingetragene Fahrstunden
    fahrstunden: uebertragUebung + einheiten('uebung'),
    // Alle Fahrstunden, die Fahrlehrer eingetragen haben - neueste zuerst
    eintraege: fahrstunden,
    einheitenGesamt: fahrstunden.reduce((summe, l) => summe + (Number(l.units) || 0), 0),
    theoriePruefung: progress.theoryExam || 'offen',
    praxisPruefung: progress.practicalExam || 'offen',
    notiz: progress.note || '',
  };
}

// Farbe für die Marker-Klasse, passend zum Prüfungsstatus.
function pruefungsMarker(status) {
  if (status === 'bestanden') return 'gruen';
  if (status === 'angemeldet') return 'blau';
  return 'grau';
}

module.exports = { berechne, pruefungsMarker };
