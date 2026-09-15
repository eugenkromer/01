// Rechnet den Ausbildungsstand eines Fahrschülers in Prozentwerte um,
// die sich direkt als Fortschrittsbalken anzeigen lassen. Wird sowohl im
// Fahrschüler-Portal als auch im Verwaltungsbereich benutzt.

const content = require('./content');

function prozent(ist, soll) {
  if (!soll) return 0;
  return Math.min(100, Math.round((ist / soll) * 100));
}

function berechne(student) {
  const progress = student && student.progress ? student.progress : {};
  const theoryDone = Array.isArray(progress.theoryDone) ? progress.theoryDone : [];
  const special = progress.special || {};

  const theorieSoll = content.theoryLessons.length;
  const theorieIst = theoryDone.length;

  const sonderfahrten = content.specialDrives.map((fahrt) => {
    const ist = Number(special[fahrt.id]) || 0;
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
      besucht: theoryDone,
    },
    sonderfahrten,
    sonderGesamt: {
      ist: sonderIst,
      soll: sonderSoll,
      prozent: prozent(sonderIst, sonderSoll),
      fertig: sonderIst >= sonderSoll,
    },
    fahrstunden: Number(progress.drivingLessons) || 0,
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
