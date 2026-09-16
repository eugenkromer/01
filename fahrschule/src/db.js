// Schlanke Datenhaltung in JSON-Dateien unter /data – kein Datenbank-
// server nötig. Für eine Fahrschule dieser Größe völlig ausreichend.
// Wächst der Bedarf, wird nur dieses Modul gegen eine echte Datenbank
// getauscht; die Routen rufen ausschließlich die Funktionen hier unten auf.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const content = require('./content');

// Wohin die JSON-Dateien geschrieben werden. Im Betrieb zeigt DATA_DIR auf
// einen dauerhaften Speicher (bei Render z. B. eine angehängte "Disk"),
// sonst würden die Daten bei jeder neuen Veröffentlichung verloren gehen.
// Ohne die Variable wird wie bisher der Ordner data/ im Projekt benutzt.
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', 'data');

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readJSON(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath(name), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

function writeJSON(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// ---------- Benutzer (Fahrschule = admin, Fahrschüler = student) ----------

function getUsers() {
  return readJSON('users', []);
}

function saveUsers(users) {
  writeJSON('users', users);
}

function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  return getUsers().find((u) => u.email === normalized) || null;
}

function getUser(id) {
  return getUsers().find((u) => u.id === id) || null;
}

function getStudents() {
  return getUsers()
    .filter((u) => u.role === 'student')
    .sort((a, b) => a.lastName.localeCompare(b.lastName, 'de'));
}

function emptyProgress() {
  const special = {};
  for (const drive of content.specialDrives) special[drive.id] = 0;
  return {
    theoryDone: [], // Nummern der besuchten Pflichtlektionen
    // Fahrstunden werden nicht mehr als Zahl gepflegt, sondern von den
    // Fahrlehrern einzeln eingetragen (Kollektion "lessons"). Die beiden
    // Felder hier sind nur noch der Übertrag für Fahrschüler, die schon
    // vor der Einführung des Portals Stunden gefahren haben.
    drivingLessons: 0,
    special,
    theoryExam: 'offen', // offen | angemeldet | bestanden
    practicalExam: 'offen', // offen | angemeldet | bestanden
    note: '',
  };
}

function createStudent(data) {
  const users = getUsers();
  const email = normalizeEmail(data.email);
  if (users.some((u) => u.email === email)) return null;
  const student = {
    id: crypto.randomUUID(),
    role: 'student',
    email,
    firstName: String(data.firstName || '').trim(),
    lastName: String(data.lastName || '').trim(),
    phone: String(data.phone || '').trim(),
    licenseClass: String(data.licenseClass || 'B').trim(),
    locationId: String(data.locationId || '').trim(),
    instructorId: data.instructorId ? String(data.instructorId) : null, // Stammfahrlehrer
    progress: emptyProgress(),
    createdAt: new Date().toISOString(),
  };
  users.push(student);
  saveUsers(users);
  return student;
}

function updateStudent(id, data) {
  const users = getUsers();
  const student = users.find((u) => u.id === id && u.role === 'student');
  if (!student) return null;
  if (data.firstName !== undefined) student.firstName = String(data.firstName).trim();
  if (data.lastName !== undefined) student.lastName = String(data.lastName).trim();
  if (data.phone !== undefined) student.phone = String(data.phone).trim();
  if (data.email !== undefined) {
    const email = normalizeEmail(data.email);
    // E-Mail ist der Login-Schlüssel – sie darf nicht doppelt vergeben werden
    if (email && !users.some((u) => u.email === email && u.id !== id)) student.email = email;
  }
  if (data.licenseClass !== undefined) student.licenseClass = String(data.licenseClass).trim();
  if (data.locationId !== undefined) student.locationId = String(data.locationId).trim();
  if (data.instructorId !== undefined) {
    student.instructorId = data.instructorId ? String(data.instructorId) : null;
  }
  saveUsers(users);
  return student;
}

function updateProgress(id, data) {
  const users = getUsers();
  const student = users.find((u) => u.id === id && u.role === 'student');
  if (!student) return null;
  const progress = { ...emptyProgress(), ...(student.progress || {}) };

  if (data.theoryDone !== undefined) {
    const list = Array.isArray(data.theoryDone) ? data.theoryDone : [data.theoryDone];
    const valid = content.theoryLessons.map((l) => l.no);
    progress.theoryDone = [...new Set(list.map(Number).filter((n) => valid.includes(n)))].sort((a, b) => a - b);
  }
  if (data.drivingLessons !== undefined) {
    progress.drivingLessons = Math.max(0, Number(data.drivingLessons) || 0);
  }
  if (data.special !== undefined) {
    for (const drive of content.specialDrives) {
      const value = data.special[drive.id];
      if (value !== undefined) progress.special[drive.id] = Math.max(0, Number(value) || 0);
    }
  }
  const examStates = ['offen', 'angemeldet', 'bestanden'];
  if (examStates.includes(data.theoryExam)) progress.theoryExam = data.theoryExam;
  if (examStates.includes(data.practicalExam)) progress.practicalExam = data.practicalExam;
  if (data.note !== undefined) progress.note = String(data.note).trim();

  student.progress = progress;
  saveUsers(users);
  return student;
}

function deleteStudent(id) {
  saveUsers(getUsers().filter((u) => !(u.id === id && u.role === 'student')));
  // Anmeldungen zu Theorieterminen mit aufräumen
  saveBookings(getBookings().filter((b) => b.studentId !== id));
  saveDocuments(getDocuments().filter((d) => d.studentId !== id));
  saveLessons(getLessons().filter((l) => l.studentId !== id));
  saveInvoices(getInvoices().filter((r) => r.studentId !== id));
  saveAttendance(getAttendance().filter((a) => a.studentId !== id));
}

// Nimmt einen einzelnen Wert oder eine Liste entgegen und lässt nur
// Standorte durch, die es auch wirklich gibt.
function normalizeLocationIds(value) {
  if (value === undefined || value === null) return [];
  const liste = Array.isArray(value) ? value : [value];
  const bekannt = new Set(content.locations.map((o) => o.id));
  return [...new Set(liste.map(String).filter((id) => bekannt.has(id)))];
}

// Welche Standorte darf dieser Nutzer verwalten? Die Fahrschule alle,
// ein Fahrlehrer die ihm zugewiesenen, alle anderen keine.
function managedLocationIds(user) {
  if (!user) return [];
  if (user.role === 'admin') return content.locations.map((o) => o.id);
  if (user.role === 'instructor') return normalizeLocationIds(user.locationIds);
  return [];
}

function canManageLocation(user, locationId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return managedLocationIds(user).includes(String(locationId));
}

function getInstructors() {
  return getUsers()
    .filter((u) => u.role === 'instructor')
    .sort((a, b) => a.lastName.localeCompare(b.lastName, 'de'));
}

function createInstructor(data) {
  const users = getUsers();
  const email = normalizeEmail(data.email);
  if (!email || users.some((u) => u.email === email)) return null;
  const instructor = {
    id: crypto.randomUUID(),
    role: 'instructor',
    email,
    firstName: String(data.firstName || '').trim(),
    lastName: String(data.lastName || '').trim(),
    phone: String(data.phone || '').trim(),
    classes: String(data.classes || '').trim(), // Ausbildungsklassen, z. B. "B, BE, A"
    // Standorte, die dieser Fahrlehrer betreut. Für sie darf er
    // Theorietermine festlegen und Fahrschüler aufnehmen.
    locationIds: normalizeLocationIds(data.locationIds),
    createdAt: new Date().toISOString(),
  };
  users.push(instructor);
  saveUsers(users);
  return instructor;
}

function updateInstructor(id, data) {
  const users = getUsers();
  const instructor = users.find((u) => u.id === id && u.role === 'instructor');
  if (!instructor) return null;
  if (data.firstName !== undefined) instructor.firstName = String(data.firstName).trim();
  if (data.lastName !== undefined) instructor.lastName = String(data.lastName).trim();
  if (data.phone !== undefined) instructor.phone = String(data.phone).trim();
  if (data.classes !== undefined) instructor.classes = String(data.classes).trim();
  if (data.locationIds !== undefined) instructor.locationIds = normalizeLocationIds(data.locationIds);
  if (data.email !== undefined) {
    const email = normalizeEmail(data.email);
    if (email && !users.some((u) => u.email === email && u.id !== id)) instructor.email = email;
  }
  saveUsers(users);
  return instructor;
}

function deleteInstructor(id) {
  saveUsers(getUsers().filter((u) => !(u.id === id && u.role === 'instructor')));
  // Eingetragene Fahrstunden bleiben erhalten - sie gehören zur Ausbildung
  // des Fahrschülers und dürfen nicht verschwinden, nur weil jemand die
  // Fahrschule verlässt. Der Name wird in der Anzeige dann als unbekannt
  // ausgewiesen.
}

function ensureSeedAdmin(seedEmail) {
  const users = getUsers();
  if (users.some((u) => u.role === 'admin')) return;
  users.push({
    id: crypto.randomUUID(),
    role: 'admin',
    email: normalizeEmail(seedEmail),
    firstName: 'Verwaltung',
    lastName: content.business.name,
    phone: '',
    createdAt: new Date().toISOString(),
  });
  saveUsers(users);
}

// ---------- Theorietermine ----------

function getTheorySessions() {
  return readJSON('theory', []).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function saveTheorySessions(sessions) {
  writeJSON('theory', sessions);
}

// Termine werden als lokale Zeit gespeichert ("2026-09-16T18:00"), so wie
// sie im Formularfeld stehen. Für Vergleiche brauchen wir deshalb die
// aktuelle Zeit im selben Format - toISOString() liefert UTC und lag auf
// einem deutschen Server zwei Stunden daneben: Ein Unterricht um 18:00
// galt dort bis 20:00 als "noch nicht begonnen".
function jetztLokal() {
  const jetzt = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${jetzt.getFullYear()}-${p(jetzt.getMonth() + 1)}-${p(jetzt.getDate())}`
    + `T${p(jetzt.getHours())}:${p(jetzt.getMinutes())}`;
}

// Der heutige Tag als Zeichenkette, z. B. "2026-09-16"
function heuteLokal() {
  return jetztLokal().slice(0, 10);
}

function getUpcomingTheorySessions() {
  const jetzt = jetztLokal();
  return getTheorySessions().filter((s) => s.startsAt >= jetzt);
}

// Alle Termine des heutigen Tages - unabhängig davon, ob sie schon
// begonnen haben. Für sie wird die Anwesenheit geführt.
function getTodaysTheorySessions() {
  const heute = heuteLokal();
  return getTheorySessions().filter((s) => String(s.startsAt).slice(0, 10) === heute);
}

function getTheorySession(id) {
  return getTheorySessions().find((s) => s.id === id) || null;
}

function createTheorySession(data) {
  const sessions = getTheorySessions();
  const session = {
    id: crypto.randomUUID(),
    startsAt: data.startsAt, // ISO-Zeitstempel, z. B. 2026-09-21T18:00
    endsAt: data.endsAt || '',
    locationId: String(data.locationId || '').trim(),
    lessonNo: data.lessonNo ? Number(data.lessonNo) : null,
    topic: String(data.topic || '').trim(),
    instructor: String(data.instructor || '').trim(),
    capacity: Math.max(0, Number(data.capacity) || 0), // 0 = unbegrenzt
    createdAt: new Date().toISOString(),
  };
  sessions.push(session);
  saveTheorySessions(sessions);
  return session;
}

function updateTheorySession(id, data) {
  const sessions = getTheorySessions();
  const session = sessions.find((s) => s.id === id);
  if (!session) return null;
  session.startsAt = data.startsAt || session.startsAt;
  session.endsAt = data.endsAt !== undefined ? data.endsAt : session.endsAt;
  session.locationId = data.locationId !== undefined ? String(data.locationId).trim() : session.locationId;
  session.lessonNo = data.lessonNo ? Number(data.lessonNo) : null;
  session.topic = data.topic !== undefined ? String(data.topic).trim() : session.topic;
  session.instructor = data.instructor !== undefined ? String(data.instructor).trim() : session.instructor;
  session.capacity = Math.max(0, Number(data.capacity) || 0);
  saveTheorySessions(sessions);

  // Wurde die Lektion des Termins geändert, zählt für alle, die da
  // waren, ab sofort die neue Lektion.
  const eintraege = getAttendance();
  let geaendert = false;
  for (const eintrag of eintraege) {
    if (eintrag.sessionId === id && eintrag.lessonNo !== session.lessonNo) {
      eintrag.lessonNo = session.lessonNo;
      geaendert = true;
    }
  }
  if (geaendert) saveAttendance(eintraege);

  return session;
}

function deleteTheorySession(id) {
  saveTheorySessions(getTheorySessions().filter((s) => s.id !== id));
  saveBookings(getBookings().filter((b) => b.sessionId !== id));
  // Mit dem Termin verschwindet auch seine Anwesenheitsliste - die
  // besuchten Lektionen der Fahrschüler ändern sich entsprechend.
  saveAttendance(getAttendance().filter((a) => a.sessionId !== id));
}

// ---------- Anmeldungen zu Theorieterminen ----------

function getBookings() {
  return readJSON('bookings', []);
}

function saveBookings(bookings) {
  writeJSON('bookings', bookings);
}

function getBookingsForSession(sessionId) {
  return getBookings().filter((b) => b.sessionId === sessionId);
}

function getBookingsForStudent(studentId) {
  return getBookings().filter((b) => b.studentId === studentId);
}

function isBooked(sessionId, studentId) {
  return getBookings().some((b) => b.sessionId === sessionId && b.studentId === studentId);
}

// Meldet einen Fahrschüler zu einem Termin an. Gibt einen Fehlertext
// zurück, wenn der Termin voll oder bereits vergangen ist.
function bookTheorySession(sessionId, studentId) {
  const session = getTheorySession(sessionId);
  if (!session) return { error: 'Dieser Termin existiert nicht mehr.' };
  if (session.startsAt < jetztLokal()) return { error: 'Dieser Termin liegt bereits in der Vergangenheit.' };
  const bookings = getBookings();
  if (bookings.some((b) => b.sessionId === sessionId && b.studentId === studentId)) {
    return { ok: true }; // schon angemeldet – kein Fehler
  }
  const taken = bookings.filter((b) => b.sessionId === sessionId).length;
  if (session.capacity > 0 && taken >= session.capacity) {
    return { error: 'Dieser Termin ist leider schon ausgebucht.' };
  }
  bookings.push({
    id: crypto.randomUUID(),
    sessionId,
    studentId,
    createdAt: new Date().toISOString(),
  });
  saveBookings(bookings);
  return { ok: true };
}

function cancelBooking(sessionId, studentId) {
  saveBookings(getBookings().filter((b) => !(b.sessionId === sessionId && b.studentId === studentId)));
}

// ---------- Fahrstunden ----------
// Jede Fahrstunde ist ein eigener Eintrag, den der Fahrlehrer nach der
// Fahrt anlegt. Daraus ergibt sich der Ausbildungsstand - und daraus
// entstehen später die Rechnungspositionen.

function getLessons() {
  return readJSON('lessons', []).sort((a, b) => b.date.localeCompare(a.date));
}

function saveLessons(lessons) {
  writeJSON('lessons', lessons);
}

function getLessonsForStudent(studentId) {
  return getLessons().filter((l) => l.studentId === studentId);
}

function getLesson(id) {
  return getLessons().find((l) => l.id === id) || null;
}

function validLessonType(type) {
  if (type === 'uebung') return true;
  return content.specialDrives.some((d) => d.id === type);
}

function createLesson(data) {
  const student = getUser(data.studentId);
  if (!student || student.role !== 'student') return { error: 'Dieser Fahrschüler wurde nicht gefunden.' };
  if (!data.date) return { error: 'Bitte gib an, wann die Fahrstunde war.' };
  const type = validLessonType(data.type) ? data.type : 'uebung';
  const units = Math.max(1, Math.min(10, Number(data.units) || 1));

  const lessons = getLessons();
  const lesson = {
    id: crypto.randomUUID(),
    studentId: data.studentId,
    instructorId: data.instructorId || null,
    date: String(data.date), // Tag der Fahrstunde
    units, // Anzahl der Unterrichtseinheiten à 45 Minuten
    type, // uebung | ueberland | autobahn | nacht
    note: String(data.note || '').trim(),
    invoiceId: null, // wird gesetzt, sobald die Stunde abgerechnet ist
    createdAt: new Date().toISOString(),
  };
  lessons.push(lesson);
  saveLessons(lessons);
  return { lesson };
}

function updateLesson(id, data) {
  const lessons = getLessons();
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) return null;
  // Eine bereits abgerechnete Fahrstunde bleibt unverändert, sonst würde
  // die Rechnung nicht mehr zu den Stunden passen.
  if (lesson.invoiceId) return null;
  if (data.date) lesson.date = String(data.date);
  if (data.units !== undefined) lesson.units = Math.max(1, Math.min(10, Number(data.units) || 1));
  if (data.type !== undefined && validLessonType(data.type)) lesson.type = data.type;
  if (data.note !== undefined) lesson.note = String(data.note).trim();
  saveLessons(lessons);
  return lesson;
}

function deleteLesson(id) {
  const lesson = getLesson(id);
  if (!lesson || lesson.invoiceId) return false; // abgerechnet bleibt bestehen
  saveLessons(getLessons().filter((l) => l.id !== id));
  return true;
}

// ---------- Anwesenheit im Theorieunterricht ----------
// Der Fahrlehrer geht nach dem Unterricht die Liste durch und hakt ab,
// wer da war. Daraus ergibt sich, welche Pflichtlektionen ein
// Fahrschüler besucht hat - niemand muss das pro Person nachtragen.

function getAttendance() {
  return readJSON('attendance', []);
}

function saveAttendance(eintraege) {
  writeJSON('attendance', eintraege);
}

function getAttendanceForSession(sessionId) {
  return getAttendance().filter((a) => a.sessionId === sessionId);
}

function getAttendanceForStudent(studentId) {
  return getAttendance().filter((a) => a.studentId === studentId);
}

// Speichert die Anwesenheitsliste eines Termins neu. Die übergebenen
// Fahrschüler waren da, alle anderen nicht - eine Korrektur der Liste
// wirkt sich damit sauber in beide Richtungen aus.
function setAttendance(sessionId, studentIds, recordedBy) {
  const session = getTheorySession(sessionId);
  if (!session) return { error: 'Diesen Termin gibt es nicht mehr.' };

  // Nur Fahrschüler des Standorts oder für diesen Termin Angemeldete -
  // dieselbe Auswahl, die auch angezeigt wird.
  const angemeldet = new Set(getBookingsForSession(sessionId).map((b) => b.studentId));
  const gueltig = new Set(
    getStudents()
      .filter((s) => !session.locationId || s.locationId === session.locationId || angemeldet.has(s.id))
      .map((s) => s.id)
  );
  const anwesend = [...new Set(studentIds || [])].filter((id) => gueltig.has(id));

  const uebrige = getAttendance().filter((a) => a.sessionId !== sessionId);
  const jetzt = new Date().toISOString();

  for (const studentId of anwesend) {
    uebrige.push({
      id: crypto.randomUUID(),
      sessionId,
      studentId,
      lessonNo: session.lessonNo || null,
      recordedBy: recordedBy || null,
      recordedAt: jetzt,
    });
  }

  saveAttendance(uebrige);
  return { anzahl: anwesend.length };
}

// Welche Pflichtlektionen hat ein Fahrschüler laut Anwesenheitslisten besucht?
function getAttendedLessons(studentId) {
  const nummern = getAttendanceForStudent(studentId)
    .map((a) => Number(a.lessonNo))
    .filter((n) => Number.isFinite(n) && n > 0);
  return [...new Set(nummern)].sort((a, b) => a - b);
}

// Termine, die schon stattgefunden haben.
function getPastTheorySessions() {
  const jetzt = jetztLokal();
  return getTheorySessions()
    .filter((s) => s.startsAt <= jetzt)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

// ---------- Dokumente (global oder für einen Fahrschüler) ----------

function getDocuments() {
  return readJSON('documents', []);
}

function saveDocuments(documents) {
  writeJSON('documents', documents);
}

function getDocumentsForStudent(studentId) {
  return getDocuments()
    .filter((d) => !d.studentId || d.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function createDocument(data) {
  const documents = getDocuments();
  const doc = {
    id: crypto.randomUUID(),
    title: String(data.title || '').trim(),
    description: String(data.description || '').trim(),
    url: String(data.url || '').trim(),
    studentId: data.studentId ? String(data.studentId) : null, // null = für alle sichtbar
    createdAt: new Date().toISOString(),
  };
  documents.push(doc);
  saveDocuments(documents);
  return doc;
}

function deleteDocument(id) {
  saveDocuments(getDocuments().filter((d) => d.id !== id));
}

// ---------- Rechnungen ----------
// Die Beträge sind Bruttopreise, wie sie Fahrschüler auch genannt
// bekommen. Die enthaltene Umsatzsteuer wird auf der Rechnung getrennt
// ausgewiesen, wie es § 14 UStG verlangt.

function getInvoices() {
  return readJSON('invoices', []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function saveInvoices(invoices) {
  writeJSON('invoices', invoices);
}

function getInvoice(id) {
  return getInvoices().find((r) => r.id === id) || null;
}

function getInvoicesForStudent(studentId) {
  return getInvoices().filter((r) => r.studentId === studentId);
}

// Fortlaufende Rechnungsnummer im Format JAHR-0001. Rechnungsnummern
// müssen lückenlos und eindeutig sein, deshalb wird immer von der
// höchsten bereits vergebenen Nummer des Jahres weitergezählt.
function nextInvoiceNumber() {
  const jahr = new Date().getFullYear();
  const praefix = `${jahr}-`;
  const hoechste = getInvoices()
    .filter((r) => typeof r.number === 'string' && r.number.startsWith(praefix))
    .map((r) => Number(r.number.slice(praefix.length)) || 0)
    .reduce((max, n) => Math.max(max, n), 0);
  return `${praefix}${String(hoechste + 1).padStart(4, '0')}`;
}

function rundeCent(betrag) {
  return Math.round(betrag * 100) / 100;
}

function createInvoice(data) {
  const student = getUser(data.studentId);
  if (!student || student.role !== 'student') {
    return { error: 'Dieser Fahrschüler wurde nicht gefunden.' };
  }

  const positionen = (data.items || [])
    .map((p) => {
      const menge = Math.max(0, Number(p.quantity) || 0);
      const einzel = Math.max(0, Number(p.unitPrice) || 0);
      return {
        label: String(p.label || '').trim(),
        quantity: menge,
        unitPrice: rundeCent(einzel),
        total: rundeCent(menge * einzel),
      };
    })
    .filter((p) => p.label && p.quantity > 0);

  if (positionen.length === 0) {
    return { error: 'Eine Rechnung braucht mindestens eine Position mit Menge und Betrag.' };
  }

  const brutto = rundeCent(positionen.reduce((summe, p) => summe + p.total, 0));
  const satz = Number(data.vatRate !== undefined ? data.vatRate : content.invoicing.vatRate) || 0;
  const netto = rundeCent(brutto / (1 + satz / 100));
  const steuer = rundeCent(brutto - netto);

  const invoices = getInvoices();
  const invoice = {
    id: crypto.randomUUID(),
    number: nextInvoiceNumber(),
    studentId: data.studentId,
    date: data.date || new Date().toISOString().slice(0, 10),
    serviceInfo: String(data.serviceInfo || '').trim(), // Leistungszeitraum
    items: positionen,
    net: netto,
    vatRate: satz,
    vat: steuer,
    total: brutto,
    status: 'offen', // offen | bezahlt | storniert
    note: String(data.note || '').trim(),
    lessonIds: Array.isArray(data.lessonIds) ? data.lessonIds : [],
    paidAt: null,
    createdAt: new Date().toISOString(),
  };
  invoices.push(invoice);
  saveInvoices(invoices);

  // Die abgerechneten Fahrstunden festschreiben, damit sie nicht ein
  // zweites Mal auf einer Rechnung landen.
  if (invoice.lessonIds.length > 0) {
    const lessons = getLessons();
    for (const lesson of lessons) {
      if (invoice.lessonIds.includes(lesson.id)) lesson.invoiceId = invoice.id;
    }
    saveLessons(lessons);
  }

  return { invoice };
}

function setInvoiceStatus(id, status) {
  const invoices = getInvoices();
  const invoice = invoices.find((r) => r.id === id);
  if (!invoice) return null;
  if (!['offen', 'bezahlt', 'storniert'].includes(status)) return null;
  invoice.status = status;
  invoice.paidAt = status === 'bezahlt' ? new Date().toISOString() : null;

  // Eine stornierte Rechnung gibt ihre Fahrstunden wieder frei, damit sie
  // korrigiert neu abgerechnet werden können.
  if (status === 'storniert' && invoice.lessonIds.length > 0) {
    const lessons = getLessons();
    for (const lesson of lessons) {
      if (lesson.invoiceId === invoice.id) lesson.invoiceId = null;
    }
    saveLessons(lessons);
  }

  saveInvoices(invoices);
  return invoice;
}

// Noch nicht abgerechnete Fahrstunden eines Fahrschülers.
function getUnbilledLessons(studentId) {
  return getLessonsForStudent(studentId).filter((l) => !l.invoiceId);
}

// ---------- Mitteilungen im Portal ----------

function getAnnouncements() {
  return readJSON('announcements', []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function createAnnouncement(data) {
  const list = readJSON('announcements', []);
  const item = {
    id: crypto.randomUUID(),
    title: String(data.title || '').trim(),
    body: String(data.body || '').trim(),
    createdAt: new Date().toISOString(),
  };
  list.push(item);
  writeJSON('announcements', list);
  return item;
}

function deleteAnnouncement(id) {
  writeJSON('announcements', readJSON('announcements', []).filter((a) => a.id !== id));
}

// ---------- Online-Anmeldungen und Kontaktanfragen ----------

function getInquiries() {
  return readJSON('inquiries', []);
}

function saveInquiries(inquiries) {
  writeJSON('inquiries', inquiries);
}

function createInquiry(data) {
  const inquiries = getInquiries();
  const inquiry = {
    id: crypto.randomUUID(),
    type: data.type === 'anmeldung' ? 'anmeldung' : 'kontakt',
    firstName: String(data.firstName || '').trim(),
    lastName: String(data.lastName || '').trim(),
    email: normalizeEmail(data.email),
    phone: String(data.phone || '').trim(),
    birthDate: String(data.birthDate || '').trim(),
    licenseClass: String(data.licenseClass || '').trim(),
    locationId: String(data.locationId || '').trim(),
    message: String(data.message || '').trim(),
    status: 'neu', // neu | bearbeitet
    createdAt: new Date().toISOString(),
  };
  inquiries.unshift(inquiry);
  saveInquiries(inquiries);
  return inquiry;
}

function markInquiryHandled(id) {
  const inquiries = getInquiries();
  const inquiry = inquiries.find((i) => i.id === id);
  if (!inquiry) return null;
  inquiry.status = 'bearbeitet';
  inquiry.handledAt = new Date().toISOString();
  saveInquiries(inquiries);
  return inquiry;
}

function deleteInquiry(id) {
  saveInquiries(getInquiries().filter((i) => i.id !== id));
}

// ---------- Login-Token (Anmeldung per E-Mail-Link) ----------

function getTokens() {
  return readJSON('tokens', []);
}

function saveTokens(tokens) {
  writeJSON('tokens', tokens);
}

function pruneExpiredTokens() {
  const now = Date.now();
  saveTokens(getTokens().filter((t) => new Date(t.expiresAt).getTime() > now));
}

function createLoginToken(email, ttlMs) {
  const tokens = getTokens();
  const token = {
    token: crypto.randomBytes(24).toString('hex'),
    email: normalizeEmail(email),
    used: false,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
  };
  tokens.push(token);
  saveTokens(tokens);
  return token;
}

function findValidLoginToken(tokenValue) {
  const token = getTokens().find((t) => t.token === tokenValue);
  if (!token || token.used) return null;
  if (new Date(token.expiresAt).getTime() < Date.now()) return null;
  return token;
}

function markLoginTokenUsed(tokenValue) {
  const tokens = getTokens();
  const token = tokens.find((t) => t.token === tokenValue);
  if (token) {
    token.used = true;
    saveTokens(tokens);
  }
}

module.exports = {
  ensureSeedAdmin,
  getInstructors,
  managedLocationIds,
  canManageLocation,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  getLessons,
  getLesson,
  getLessonsForStudent,
  createLesson,
  updateLesson,
  deleteLesson,
  getInvoices,
  getInvoice,
  getInvoicesForStudent,
  createInvoice,
  setInvoiceStatus,
  getUnbilledLessons,
  findUserByEmail,
  getUser,
  getUsers,
  getStudents,
  createStudent,
  updateStudent,
  updateProgress,
  deleteStudent,
  emptyProgress,
  getTheorySessions,
  getUpcomingTheorySessions,
  getTheorySession,
  createTheorySession,
  updateTheorySession,
  deleteTheorySession,
  getAttendance,
  getAttendanceForSession,
  getAttendanceForStudent,
  getAttendedLessons,
  setAttendance,
  getPastTheorySessions,
  getTodaysTheorySessions,
  jetztLokal,
  heuteLokal,
  getBookings,
  getBookingsForSession,
  getBookingsForStudent,
  isBooked,
  bookTheorySession,
  cancelBooking,
  getDocuments,
  getDocumentsForStudent,
  createDocument,
  deleteDocument,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getInquiries,
  createInquiry,
  markInquiryHandled,
  deleteInquiry,
  createLoginToken,
  findValidLoginToken,
  markLoginTokenUsed,
  pruneExpiredTokens,
};
