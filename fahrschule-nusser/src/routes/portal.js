// Der eingeloggte Bereich für Fahrschüler.

const express = require('express');

const db = require('../db');
const content = require('../content');
const progress = require('../progress');
const navigation = require('../navigation');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

router.use(requireLogin);

// Gemeinsame Werte, die jede Portalseite braucht.
function basis(req, titel, zusatz = {}) {
  return {
    title: titel,
    portal: true,
    bodyClass: 'portal-body',
    ...zusatz,
  };
}

function ortName(id) {
  const ort = content.locations.find((o) => o.id === id);
  return ort ? ort.name : '';
}

// Reichert Theorietermine um Ortsname, freie Plätze und den eigenen
// Anmeldestatus an.
function termineAufbereiten(sessions, studentId) {
  return sessions.map((session) => {
    const belegt = db.getBookingsForSession(session.id).length;
    return {
      ...session,
      ortName: ortName(session.locationId),
      belegt,
      frei: session.capacity > 0 ? Math.max(0, session.capacity - belegt) : null,
      ausgebucht: session.capacity > 0 && belegt >= session.capacity,
      angemeldet: studentId ? db.isBooked(session.id, studentId) : false,
    };
  });
}

// ---------- Übersicht ----------

router.get('/', (req, res) => {
  // Jede Rolle landet in ihrem eigenen Bereich.
  if (req.user.role === 'admin') return res.redirect('/portal/verwaltung');
  if (req.user.role === 'instructor') return res.redirect('/portal/fahrlehrer');

  const stand = progress.berechne(req.user);
  const meine = db.getBookingsForStudent(req.user.id).map((b) => b.sessionId);
  const kommende = termineAufbereiten(db.getUpcomingTheorySessions(), req.user.id);

  res.render('portal/dashboard', basis(req, 'Mein Bereich', {
    stand,
    naechsteTermine: kommende.filter((t) => meine.includes(t.id)).slice(0, 3),
    offeneTermine: kommende.filter((t) => !meine.includes(t.id) && !t.ausgebucht).slice(0, 3),
    mitteilungen: db.getAnnouncements().slice(0, 3),
    dokumente: db.getDocumentsForStudent(req.user.id).slice(0, 3),
    pruefungsMarker: progress.pruefungsMarker,
  }));
});

// ---------- Theorietermine ----------

router.get('/theorie', (req, res) => {
  if (req.user.role === 'admin') return res.redirect('/portal/verwaltung/theorie');
  if (req.user.role === 'instructor') return res.redirect('/portal/fahrlehrer');

  res.render('portal/theorie', basis(req, 'Theorietermine', {
    termine: termineAufbereiten(db.getUpcomingTheorySessions(), req.user.id),
    stand: progress.berechne(req.user),
    hinweis: req.query.hinweis || null,
    fehler: req.query.fehler || null,
  }));
});

router.post('/theorie/:id/anmelden', (req, res) => {
  if (req.user.role !== 'student') return res.redirect('/portal');
  const ergebnis = db.bookTheorySession(req.params.id, req.user.id);
  if (ergebnis.error) {
    return res.redirect('/portal/theorie?fehler=' + encodeURIComponent(ergebnis.error));
  }
  res.redirect('/portal/theorie?hinweis=' + encodeURIComponent('Du bist für den Termin angemeldet.'));
});

router.post('/theorie/:id/abmelden', (req, res) => {
  if (req.user.role !== 'student') return res.redirect('/portal');
  db.cancelBooking(req.params.id, req.user.id);
  res.redirect('/portal/theorie?hinweis=' + encodeURIComponent('Deine Anmeldung wurde zurückgenommen.'));
});

// ---------- Lernfortschritt ----------

router.get('/fortschritt', (req, res) => {
  if (req.user.role !== 'student') return res.redirect('/portal');

  res.render('portal/fortschritt', basis(req, 'Mein Fortschritt', {
    stand: progress.berechne(req.user),
    pruefungsMarker: progress.pruefungsMarker,
  }));
});

// ---------- Dokumente ----------

router.get('/dokumente', (req, res) => {
  if (req.user.role === 'admin') return res.redirect('/portal/verwaltung/dokumente');
  if (req.user.role === 'instructor') return res.redirect('/portal/fahrlehrer');

  res.render('portal/dokumente', basis(req, 'Unterlagen', {
    dokumente: db.getDocumentsForStudent(req.user.id),
  }));
});

// ---------- Mehr (Sammelseite der Leiste auf dem Handy) ----------

router.get('/mehr', (req, res) => {
  const weitere = navigation.weitere(req.user);
  // Gibt es nichts zu sammeln, ist die Seite überflüssig.
  if (weitere.length === 0) return res.redirect('/portal');

  res.render('portal/mehr', basis(req, 'Mehr', { weitere }));
});

// ---------- Rechnungen ----------

router.get('/rechnungen', (req, res) => {
  if (req.user.role !== 'student') return res.redirect('/portal');

  const rechnungen = db.getInvoicesForStudent(req.user.id);
  res.render('portal/rechnungen', basis(req, 'Meine Rechnungen', {
    rechnungen,
    offenerBetrag: rechnungen
      .filter((r) => r.status === 'offen')
      .reduce((summe, r) => summe + r.total, 0),
  }));
});

// Einzelne Rechnung in Druckansicht. Fahrschüler sehen nur ihre eigenen.
router.get('/rechnungen/:id', (req, res) => {
  const rechnung = db.getInvoice(req.params.id);
  const darfSehen = rechnung
    && (req.user.role === 'admin' || rechnung.studentId === req.user.id);

  if (!darfSehen) {
    return res.status(404).render('site/not-found', { title: 'Seite nicht gefunden' });
  }

  res.render('portal/rechnung', basis(req, `Rechnung ${rechnung.number}`, {
    rechnung,
    student: db.getUser(rechnung.studentId),
    bodyClass: 'rechnung-body',
  }));
});

// ---------- Profil ----------

router.get('/profil', (req, res) => {
  res.render('portal/profil', basis(req, 'Meine Daten', {
    ortName: req.user.locationId ? ortName(req.user.locationId) : '',
    hinweis: req.query.hinweis || null,
  }));
});

router.post('/profil', (req, res) => {
  if (req.user.role !== 'student') return res.redirect('/portal/profil');
  // Fahrschüler dürfen ihre Kontaktdaten pflegen – die E-Mail-Adresse
  // bleibt unverändert, weil daran der Zugang hängt. Sie ändert die
  // Fahrschule im Verwaltungsbereich.
  db.updateStudent(req.user.id, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
  });
  res.redirect('/portal/profil?hinweis=' + encodeURIComponent('Deine Daten wurden gespeichert.'));
});

module.exports = router;
