// Bereich für Fahrlehrer: Fahrschüler ansehen und Fahrstunden eintragen.
// Die Fahrschule selbst (Rolle "admin") darf hier alles ebenfalls.

const express = require('express');

const db = require('../db');
const content = require('../content');
const progress = require('../progress');
const { requireInstructor } = require('../middleware/auth');

const router = express.Router();

router.use(requireInstructor);

function basis(titel, zusatz = {}) {
  return { title: titel, portal: true, bodyClass: 'portal-body', ...zusatz };
}

function zurueck(res, ziel, hinweis, fehler) {
  const query = fehler
    ? '?fehler=' + encodeURIComponent(fehler)
    : hinweis ? '?hinweis=' + encodeURIComponent(hinweis) : '';
  res.redirect(ziel + query);
}

// Beschriftung einer Fahrstunden-Art, z. B. "Überlandfahrt"
function artName(type) {
  if (type === 'uebung') return 'Übungsstunde';
  const fahrt = content.specialDrives.find((d) => d.id === type);
  return fahrt ? fahrt.label : type;
}

function instructorName(id) {
  const user = id ? db.getUser(id) : null;
  return user ? `${user.firstName} ${user.lastName}` : 'nicht vermerkt';
}

// ---------- Übersicht: alle Fahrschüler ----------

router.get('/', (req, res) => {
  const eigene = req.user.role === 'instructor' ? req.user.id : null;

  const studenten = db.getStudents().map((s) => {
    const stand = progress.berechne(s);
    const letzte = stand.eintraege[0] || null;
    return {
      ...s,
      stand,
      meiner: eigene ? s.instructorId === eigene : false,
      letzteFahrstunde: letzte,
    };
  });

  // Die eigenen Fahrschüler zuerst - der Rest bleibt sichtbar, damit
  // Vertretungen möglich sind.
  studenten.sort((a, b) => (b.meiner ? 1 : 0) - (a.meiner ? 1 : 0));

  res.render('instructor/dashboard', basis('Meine Fahrschüler', {
    studenten,
    meineHeute: db.getLessons().filter(
      (l) => l.instructorId === req.user.id && l.date === new Date().toISOString().slice(0, 10)
    ).length,
    artName,
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

// ---------- Ein Fahrschüler: Fahrstunden eintragen ----------

router.get('/fahrschueler/:id', (req, res) => {
  const student = db.getUser(req.params.id);
  if (!student || student.role !== 'student') {
    return zurueck(res, '/portal/fahrlehrer', null, 'Dieser Fahrschüler wurde nicht gefunden.');
  }

  res.render('instructor/fahrschueler', basis(`${student.firstName} ${student.lastName}`, {
    student,
    stand: progress.berechne(student),
    // Braucht nur das Büro, um eine Stunde für jemand anderen nachzutragen
    fahrlehrer: db.getInstructors(),
    artName,
    instructorName,
    heute: new Date().toISOString().slice(0, 10),
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

router.post('/fahrschueler/:id/fahrstunde', (req, res) => {
  const ziel = '/portal/fahrlehrer/fahrschueler/' + req.params.id;

  const ergebnis = db.createLesson({
    studentId: req.params.id,
    // Trägt die Fahrschule eine Stunde nach, wird der im Formular
    // gewählte Fahrlehrer vermerkt - sonst der angemeldete.
    instructorId: req.body.instructorId || req.user.id,
    date: req.body.date,
    units: req.body.units,
    type: req.body.type,
    note: req.body.note,
  });

  if (ergebnis.error) return zurueck(res, ziel, null, ergebnis.error);
  zurueck(res, ziel, 'Fahrstunde eingetragen.');
});

// Theorielektionen abhaken und Prüfungsstand setzen. Fahrlehrer halten
// den Unterricht und nehmen die Prüfungen mit ab, deshalb pflegen sie das
// selbst. Der Übertrag alter Fahrstunden bleibt dem Büro vorbehalten -
// das ist eine einmalige Verwaltungssache beim Umstieg.
router.post('/fahrschueler/:id/theorie', (req, res) => {
  const ziel = '/portal/fahrlehrer/fahrschueler/' + req.params.id;

  const student = db.getUser(req.params.id);
  if (!student || student.role !== 'student') {
    return zurueck(res, '/portal/fahrlehrer', null, 'Dieser Fahrschüler wurde nicht gefunden.');
  }

  db.updateProgress(req.params.id, {
    theoryDone: req.body.theoryDone || [],
    theoryExam: req.body.theoryExam,
    practicalExam: req.body.practicalExam,
    note: req.body.note,
  });

  zurueck(res, ziel, 'Theoriestand gespeichert.');
});

router.post('/fahrstunde/:id/loeschen', (req, res) => {
  const lesson = db.getLesson(req.params.id);
  if (!lesson) return zurueck(res, '/portal/fahrlehrer', null, 'Diese Fahrstunde gibt es nicht mehr.');

  const ziel = '/portal/fahrlehrer/fahrschueler/' + lesson.studentId;

  // Ein Fahrlehrer darf nur die eigenen Einträge zurücknehmen; die
  // Fahrschule darf alle korrigieren.
  if (req.user.role === 'instructor' && lesson.instructorId !== req.user.id) {
    return zurueck(res, ziel, null, 'Diese Fahrstunde hat jemand anderes eingetragen.');
  }

  if (!db.deleteLesson(req.params.id)) {
    return zurueck(res, ziel, null,
      'Diese Fahrstunde steht schon auf einer Rechnung und kann nicht mehr gelöscht werden.');
  }
  zurueck(res, ziel, 'Fahrstunde gelöscht.');
});

module.exports = router;
