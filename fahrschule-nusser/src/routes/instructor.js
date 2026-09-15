// Bereich für Fahrlehrer: Fahrschüler ansehen und Fahrstunden eintragen.
// Die Fahrschule selbst (Rolle "admin") darf hier alles ebenfalls.

const express = require('express');

const db = require('../db');
const content = require('../content');
const progress = require('../progress');
const { sendMail } = require('../mailer');
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

function ortName(id) {
  const ort = content.locations.find((o) => o.id === id);
  return ort ? ort.name : '';
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
    // Vergangene Termine, deren Anwesenheitsliste noch niemand geführt hat
    offeneListen: db.getPastTheorySessions()
      .filter((t) => db.getAttendanceForSession(t.id).length === 0)
      .map((t) => ({ ...t, ortName: ortName(t.locationId) })),
    meineHeute: db.getLessons().filter(
      (l) => l.instructorId === req.user.id && l.date === new Date().toISOString().slice(0, 10)
    ).length,
    artName,
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

// ---------- Theorietermine: Anwesenheit abhaken ----------

// Die Standorte, für die der angemeldete Nutzer zuständig ist
function meineStandorte(user) {
  const ids = db.managedLocationIds(user);
  return content.locations.filter((o) => ids.includes(o.id));
}

// Ergänzt einen Termin um Anzeigewerte und die Frage, ob der angemeldete
// Nutzer ihn bearbeiten darf.
function terminAufbereiten(termin, user) {
  const anwesend = db.getAttendanceForSession(termin.id).length;
  return {
    ...termin,
    ortName: ortName(termin.locationId),
    angemeldet: db.getBookingsForSession(termin.id).length,
    anwesend,
    erfasst: anwesend > 0,
    meiner: db.canManageLocation(user, termin.locationId),
  };
}

router.get('/theorie', (req, res) => {
  const standorte = meineStandorte(req.user);

  res.render('instructor/theorie', basis('Theorietermine', {
    vergangene: db.getPastTheorySessions().map((t) => terminAufbereiten(t, req.user)),
    kommende: db.getUpcomingTheorySessions().map((t) => terminAufbereiten(t, req.user)),
    standorte,
    bearbeiten: null,
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

router.get('/theorie/:id/bearbeiten', (req, res) => {
  const termin = db.getTheorySession(req.params.id);
  if (!termin) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null, 'Diesen Termin gibt es nicht mehr.');
  }
  if (!db.canManageLocation(req.user, termin.locationId)) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null,
      'Diesen Termin verwaltet ein anderer Standort.');
  }

  res.render('instructor/theorie', basis('Termin ändern', {
    vergangene: db.getPastTheorySessions().map((t) => terminAufbereiten(t, req.user)),
    kommende: db.getUpcomingTheorySessions().map((t) => terminAufbereiten(t, req.user)),
    standorte: meineStandorte(req.user),
    bearbeiten: termin,
    hinweis: null,
    fehler: null,
  }));
});

// Termin anlegen - nur für einen Standort, den man betreut.
router.post('/theorie', (req, res) => {
  if (!req.body.startsAt) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null, 'Bitte gib Datum und Uhrzeit an.');
  }
  if (!db.canManageLocation(req.user, req.body.locationId)) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null,
      'Für diesen Standort kannst du keine Termine anlegen.');
  }

  db.createTheorySession({
    ...req.body,
    // Wer den Termin anlegt, steht standardmäßig auch davor
    instructor: req.body.instructor || `${req.user.firstName} ${req.user.lastName}`,
  });
  zurueck(res, '/portal/fahrlehrer/theorie', 'Termin angelegt.');
});

router.post('/theorie/:id/aendern', (req, res) => {
  const termin = db.getTheorySession(req.params.id);
  if (!termin) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null, 'Diesen Termin gibt es nicht mehr.');
  }
  // Sowohl der bisherige als auch der neue Standort müssen einem gehören,
  // sonst könnte man Termine in einen fremden Standort verschieben.
  if (!db.canManageLocation(req.user, termin.locationId)
      || !db.canManageLocation(req.user, req.body.locationId)) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null,
      'Diesen Termin verwaltet ein anderer Standort.');
  }

  db.updateTheorySession(req.params.id, req.body);
  zurueck(res, '/portal/fahrlehrer/theorie', 'Termin gespeichert.');
});

router.post('/theorie/:id/loeschen', (req, res) => {
  const termin = db.getTheorySession(req.params.id);
  if (!termin) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null, 'Diesen Termin gibt es nicht mehr.');
  }
  if (!db.canManageLocation(req.user, termin.locationId)) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null,
      'Diesen Termin verwaltet ein anderer Standort.');
  }

  db.deleteTheorySession(req.params.id);
  zurueck(res, '/portal/fahrlehrer/theorie',
    'Termin gelöscht. Anmeldungen und Anwesenheitsliste sind damit ebenfalls weg.');
});

router.get('/theorie/:id', (req, res) => {
  const termin = db.getTheorySession(req.params.id);
  if (!termin) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null, 'Diesen Termin gibt es nicht mehr.');
  }

  if (!db.canManageLocation(req.user, termin.locationId)) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null,
      'Die Anwesenheit für diesen Termin führt ein anderer Standort.');
  }

  const angemeldet = new Set(db.getBookingsForSession(termin.id).map((b) => b.studentId));
  const anwesend = new Set(db.getAttendanceForSession(termin.id).map((a) => a.studentId));
  // Wurde die Liste noch nie geführt, sind die Angemeldeten vorausgewählt -
  // das ist der häufigste Fall und spart Klicks.
  const erfasst = anwesend.size > 0;

  const teilnehmer = db.getStudents().map((s) => {
    // Hat der Fahrschüler diese Lektion schon woanders besucht? Die
    // Einträge dieses Termins zählen dabei nicht mit - sonst stünde der
    // Hinweis bei jedem, den man gerade abgehakt hat.
    const anderswo = db.getAttendanceForStudent(s.id)
      .filter((a) => a.sessionId !== termin.id)
      .map((a) => Number(a.lessonNo));
    const uebertrag = progress.berechne(s).theorie.uebertrag;

    return {
      ...s,
      angemeldet: angemeldet.has(s.id),
      anwesend: erfasst ? anwesend.has(s.id) : angemeldet.has(s.id),
      schonBesucht: termin.lessonNo
        ? anderswo.includes(termin.lessonNo) || uebertrag.includes(termin.lessonNo)
        : false,
    };
  });

  // Angemeldete zuerst, der Rest darunter für spontane Teilnehmer
  teilnehmer.sort((a, b) => (b.angemeldet ? 1 : 0) - (a.angemeldet ? 1 : 0));

  res.render('instructor/anwesenheit', basis('Anwesenheitsliste', {
    termin: { ...termin, ortName: ortName(termin.locationId) },
    teilnehmer,
    erfasst,
    anzahlAngemeldet: angemeldet.size,
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

router.post('/theorie/:id', (req, res) => {
  const termin = db.getTheorySession(req.params.id);
  if (termin && !db.canManageLocation(req.user, termin.locationId)) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null,
      'Die Anwesenheit für diesen Termin führt ein anderer Standort.');
  }

  const anwesend = [].concat(req.body.anwesend || []);
  const ergebnis = db.setAttendance(req.params.id, anwesend, req.user.id);

  if (ergebnis.error) {
    return zurueck(res, '/portal/fahrlehrer/theorie', null, ergebnis.error);
  }

  const lektion = termin && termin.lessonNo ? ` Lektion ${termin.lessonNo} zählt jetzt für sie.` : '';
  zurueck(res, '/portal/fahrlehrer/theorie',
    `Anwesenheit gespeichert: ${ergebnis.anzahl} ${ergebnis.anzahl === 1 ? 'Person war' : 'Personen waren'} da.${lektion}`);
});

// ---------- Fahrschüler aufnehmen ----------

router.get('/aufnehmen', (req, res) => {
  const standorte = meineStandorte(req.user);

  res.render('instructor/aufnehmen', basis('Fahrschüler aufnehmen', {
    standorte,
    // Offene Online-Anmeldungen, die zu den eigenen Standorten passen -
    // von dort lässt sich eine Aufnahme mit einem Klick übernehmen.
    anfragen: db.getInquiries().filter(
      (a) => a.type === 'anmeldung'
        && a.status === 'neu'
        && (!a.locationId || db.canManageLocation(req.user, a.locationId))
    ).map((a) => ({ ...a, ortName: ortName(a.locationId) })),
    werte: {},
    fehler: null,
  }));
});

router.post('/aufnehmen', async (req, res, next) => {
  try {
    const standorte = meineStandorte(req.user);
    const werte = req.body;

    const zurueckMitFehler = (text) =>
      res.status(400).render('instructor/aufnehmen', basis('Fahrschüler aufnehmen', {
        standorte,
        anfragen: [],
        werte,
        fehler: text,
      }));

    if (!String(werte.firstName || '').trim() || !String(werte.lastName || '').trim()) {
      return zurueckMitFehler('Bitte trage Vor- und Nachnamen ein.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(werte.email || '').trim())) {
      return zurueckMitFehler('Bitte trage eine gültige E-Mail-Adresse ein.');
    }
    // Aufgenommen wird an einem Standort, den man selbst betreut.
    if (!db.canManageLocation(req.user, werte.locationId)) {
      return zurueckMitFehler('Bitte wähle einen Standort aus, den du betreust.');
    }

    const student = db.createStudent({
      ...werte,
      // Wer aufnimmt, ist zunächst auch Stammfahrlehrer
      instructorId: werte.instructorId || req.user.id,
    });

    if (!student) {
      return zurueckMitFehler('Mit dieser E-Mail-Adresse ist bereits ein Zugang angelegt.');
    }

    // Kam die Aufnahme aus einer Online-Anmeldung, ist die damit erledigt.
    if (werte.inquiryId) db.markInquiryHandled(werte.inquiryId);

    await willkommensMail(student);
    zurueck(res, '/portal/fahrlehrer/fahrschueler/' + student.id,
      'Fahrschüler aufgenommen – die Begrüßungsmail ist unterwegs.');
  } catch (err) {
    next(err);
  }
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

  // Bewusst ohne theoryDone: welche Lektionen besucht wurden, ergibt sich
  // aus den Anwesenheitslisten der Termine, nicht aus Einzel-Abhaken.
  db.updateProgress(req.params.id, {
    theoryExam: req.body.theoryExam,
    practicalExam: req.body.practicalExam,
    note: req.body.note,
  });

  zurueck(res, ziel, 'Gespeichert.');
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
      '- deine Rechnungen und die Unterlagen, die wir für dich hinterlegt haben',
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
