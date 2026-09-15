// Verwaltungsbereich der Fahrschule: Anfragen bearbeiten, Fahrschüler und
// deren Ausbildungsstand pflegen, Theorietermine planen, Unterlagen und
// Mitteilungen einstellen.

const express = require('express');

const db = require('../db');
const content = require('../content');
const progress = require('../progress');
const { sendMail } = require('../mailer');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAdmin);

function basis(titel, zusatz = {}) {
  return { title: titel, portal: true, bodyClass: 'portal-body', ...zusatz };
}

function ortName(id) {
  const ort = content.locations.find((o) => o.id === id);
  return ort ? ort.name : '';
}

function zurueck(res, ziel, hinweis, fehler) {
  const query = fehler
    ? '?fehler=' + encodeURIComponent(fehler)
    : hinweis ? '?hinweis=' + encodeURIComponent(hinweis) : '';
  res.redirect(ziel + query);
}

// ---------- Übersicht ----------

router.get('/', (req, res) => {
  const anfragen = db.getInquiries();
  const studenten = db.getStudents();
  const termine = db.getUpcomingTheorySessions();

  res.render('admin/dashboard', basis('Verwaltung', {
    offeneAnfragen: anfragen.filter((a) => a.status === 'neu'),
    anzahlStudenten: studenten.length,
    naechsteTermine: termine.slice(0, 5).map((t) => ({
      ...t,
      ortName: ortName(t.locationId),
      belegt: db.getBookingsForSession(t.id).length,
    })),
    anzahlTermine: termine.length,
    kurzVorPruefung: studenten.filter((s) => {
      const stand = progress.berechne(s);
      return stand.theorie.fertig && stand.sonderGesamt.fertig && stand.praxisPruefung !== 'bestanden';
    }),
  }));
});

// ---------- Anfragen ----------

router.get('/anfragen', (req, res) => {
  res.render('admin/anfragen', basis('Anfragen', {
    anfragen: db.getInquiries().map((a) => ({ ...a, ortName: ortName(a.locationId) })),
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

router.post('/anfragen/:id/erledigt', (req, res) => {
  db.markInquiryHandled(req.params.id);
  zurueck(res, '/portal/verwaltung/anfragen', 'Anfrage als bearbeitet markiert.');
});

router.post('/anfragen/:id/loeschen', (req, res) => {
  db.deleteInquiry(req.params.id);
  zurueck(res, '/portal/verwaltung/anfragen', 'Anfrage gelöscht.');
});

// Übernimmt eine Online-Anmeldung als Fahrschüler ins Portal.
router.post('/anfragen/:id/uebernehmen', async (req, res, next) => {
  try {
    const anfrage = db.getInquiries().find((a) => a.id === req.params.id);
    if (!anfrage) return zurueck(res, '/portal/verwaltung/anfragen', null, 'Diese Anfrage gibt es nicht mehr.');

    const student = db.createStudent({
      email: anfrage.email,
      firstName: anfrage.firstName,
      lastName: anfrage.lastName,
      phone: anfrage.phone,
      licenseClass: anfrage.licenseClass || 'B',
      locationId: anfrage.locationId,
    });

    if (!student) {
      return zurueck(res, '/portal/verwaltung/anfragen', null,
        'Mit dieser E-Mail-Adresse ist bereits ein Zugang angelegt.');
    }

    db.markInquiryHandled(anfrage.id);
    await willkommensMail(student);
    zurueck(res, '/portal/verwaltung/fahrschueler/' + student.id,
      'Zugang angelegt – die Begrüßungsmail ist unterwegs.');
  } catch (err) {
    next(err);
  }
});

// ---------- Fahrschüler ----------

router.get('/fahrschueler', (req, res) => {
  const studenten = db.getStudents().map((s) => ({
    ...s,
    stand: progress.berechne(s),
    ortName: ortName(s.locationId),
  }));

  res.render('admin/fahrschueler', basis('Fahrschüler', {
    studenten,
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
    pruefungsMarker: progress.pruefungsMarker,
  }));
});

router.get('/fahrschueler/neu', (req, res) => {
  res.render('admin/fahrschueler-form', basis('Fahrschüler anlegen', {
    student: null,
    fehler: null,
  }));
});

router.post('/fahrschueler', async (req, res, next) => {
  try {
    const student = db.createStudent(req.body);
    if (!student) {
      return res.status(400).render('admin/fahrschueler-form', basis('Fahrschüler anlegen', {
        student: req.body,
        fehler: 'Mit dieser E-Mail-Adresse ist bereits ein Zugang angelegt.',
      }));
    }
    await willkommensMail(student);
    zurueck(res, '/portal/verwaltung/fahrschueler/' + student.id,
      'Fahrschüler angelegt – die Begrüßungsmail ist unterwegs.');
  } catch (err) {
    next(err);
  }
});

router.get('/fahrschueler/:id', (req, res) => {
  const student = db.getUser(req.params.id);
  if (!student || student.role !== 'student') {
    return zurueck(res, '/portal/verwaltung/fahrschueler', null, 'Dieser Fahrschüler wurde nicht gefunden.');
  }

  const meineBuchungen = db.getBookingsForStudent(student.id).map((b) => b.sessionId);

  res.render('admin/fahrschueler-detail', basis(`${student.firstName} ${student.lastName}`, {
    student,
    stand: progress.berechne(student),
    ortName: ortName(student.locationId),
    termine: db.getTheorySessions()
      .filter((t) => meineBuchungen.includes(t.id))
      .map((t) => ({ ...t, ortName: ortName(t.locationId) })),
    dokumente: db.getDocuments().filter((d) => d.studentId === student.id),
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

router.post('/fahrschueler/:id/stammdaten', (req, res) => {
  db.updateStudent(req.params.id, req.body);
  zurueck(res, '/portal/verwaltung/fahrschueler/' + req.params.id, 'Stammdaten gespeichert.');
});

router.post('/fahrschueler/:id/fortschritt', (req, res) => {
  // Aus dem Formular kommen die Lektionen als Checkbox-Werte und die
  // Sonderfahrten als "special_<id>"-Felder.
  const special = {};
  for (const fahrt of content.specialDrives) {
    special[fahrt.id] = req.body['special_' + fahrt.id];
  }

  db.updateProgress(req.params.id, {
    theoryDone: req.body.theoryDone || [],
    drivingLessons: req.body.drivingLessons,
    special,
    theoryExam: req.body.theoryExam,
    practicalExam: req.body.practicalExam,
    note: req.body.note,
  });

  zurueck(res, '/portal/verwaltung/fahrschueler/' + req.params.id, 'Ausbildungsstand gespeichert.');
});

router.post('/fahrschueler/:id/loeschen', (req, res) => {
  db.deleteStudent(req.params.id);
  zurueck(res, '/portal/verwaltung/fahrschueler', 'Fahrschüler gelöscht.');
});

// ---------- Theorietermine ----------

router.get('/theorie', (req, res) => {
  res.render('admin/theorie', basis('Theorietermine', {
    termine: db.getTheorySessions().map((t) => ({
      ...t,
      ortName: ortName(t.locationId),
      belegt: db.getBookingsForSession(t.id).length,
      vergangen: t.startsAt < new Date().toISOString(),
    })),
    bearbeiten: null,
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

router.get('/theorie/:id/bearbeiten', (req, res) => {
  const termin = db.getTheorySession(req.params.id);
  if (!termin) return zurueck(res, '/portal/verwaltung/theorie', null, 'Diesen Termin gibt es nicht mehr.');

  res.render('admin/theorie', basis('Termin bearbeiten', {
    termine: db.getTheorySessions().map((t) => ({
      ...t,
      ortName: ortName(t.locationId),
      belegt: db.getBookingsForSession(t.id).length,
      vergangen: t.startsAt < new Date().toISOString(),
    })),
    bearbeiten: termin,
    hinweis: null,
    fehler: null,
  }));
});

router.post('/theorie', (req, res) => {
  if (!req.body.startsAt) {
    return zurueck(res, '/portal/verwaltung/theorie', null, 'Bitte gib Datum und Uhrzeit an.');
  }
  db.createTheorySession(req.body);
  zurueck(res, '/portal/verwaltung/theorie', 'Termin angelegt.');
});

router.post('/theorie/:id', (req, res) => {
  db.updateTheorySession(req.params.id, req.body);
  zurueck(res, '/portal/verwaltung/theorie', 'Termin gespeichert.');
});

router.post('/theorie/:id/loeschen', (req, res) => {
  db.deleteTheorySession(req.params.id);
  zurueck(res, '/portal/verwaltung/theorie', 'Termin gelöscht.');
});

router.get('/theorie/:id/teilnehmer', (req, res) => {
  const termin = db.getTheorySession(req.params.id);
  if (!termin) return zurueck(res, '/portal/verwaltung/theorie', null, 'Diesen Termin gibt es nicht mehr.');

  const teilnehmer = db.getBookingsForSession(termin.id)
    .map((b) => db.getUser(b.studentId))
    .filter(Boolean);

  res.render('admin/teilnehmer', basis('Teilnehmerliste', {
    termin: { ...termin, ortName: ortName(termin.locationId) },
    teilnehmer,
  }));
});

// ---------- Unterlagen ----------

router.get('/dokumente', (req, res) => {
  res.render('admin/dokumente', basis('Unterlagen', {
    dokumente: db.getDocuments()
      .map((d) => ({ ...d, student: d.studentId ? db.getUser(d.studentId) : null }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    studenten: db.getStudents(),
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

router.post('/dokumente', (req, res) => {
  if (!String(req.body.title || '').trim() || !String(req.body.url || '').trim()) {
    return zurueck(res, '/portal/verwaltung/dokumente', null, 'Bitte gib einen Titel und eine Adresse an.');
  }
  db.createDocument(req.body);
  zurueck(res, '/portal/verwaltung/dokumente', 'Unterlage hinterlegt.');
});

router.post('/dokumente/:id/loeschen', (req, res) => {
  db.deleteDocument(req.params.id);
  zurueck(res, '/portal/verwaltung/dokumente', 'Unterlage entfernt.');
});

// ---------- Mitteilungen ----------

router.get('/mitteilungen', (req, res) => {
  res.render('admin/mitteilungen', basis('Mitteilungen', {
    mitteilungen: db.getAnnouncements(),
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

router.post('/mitteilungen', (req, res) => {
  if (!String(req.body.title || '').trim() || !String(req.body.body || '').trim()) {
    return zurueck(res, '/portal/verwaltung/mitteilungen', null, 'Bitte gib einen Titel und einen Text an.');
  }
  db.createAnnouncement(req.body);
  zurueck(res, '/portal/verwaltung/mitteilungen', 'Mitteilung veröffentlicht.');
});

router.post('/mitteilungen/:id/loeschen', (req, res) => {
  db.deleteAnnouncement(req.params.id);
  zurueck(res, '/portal/verwaltung/mitteilungen', 'Mitteilung gelöscht.');
});

// ---------- Hilfsfunktion ----------

async function willkommensMail(student) {
  const link = `${process.env.BASE_URL || 'http://localhost:3000'}/portal/login`;
  await sendMail({
    to: student.email,
    subject: `Dein Zugang zum Portal der ${content.business.name}`,
    text: [
      `Hallo ${student.firstName},`,
      '',
      'wir haben dir deinen persönlichen Bereich eingerichtet. Dort siehst du jederzeit:',
      '',
      '- alle kommenden Theorietermine und kannst dich anmelden',
      '- welche Pflichtlektionen du schon besucht hast',
      '- wie viele Fahrstunden und Sonderfahrten dir noch fehlen',
      '- die Unterlagen, die wir für dich hinterlegt haben',
      '',
      `So kommst du rein: ${link}`,
      '',
      `Gib dort einfach diese E-Mail-Adresse ein (${student.email}) – du bekommst dann`,
      'einen Anmeldelink zugeschickt. Ein Passwort brauchst du nicht.',
      '',
      'Viel Erfolg bei der Ausbildung!',
      content.business.name,
      content.business.phone,
    ].join('\n'),
  });
}

module.exports = router;
