// Schlanke Datenhaltung in JSON-Dateien unter /data – kein Datenbank-
// server nötig. Für eine Fahrschule dieser Größe völlig ausreichend.
// Wächst der Bedarf, wird nur dieses Modul gegen eine echte Datenbank
// getauscht; die Routen rufen ausschließlich die Funktionen hier unten auf.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const content = require('./content');

const DATA_DIR = path.join(__dirname, '..', 'data');

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
    drivingLessons: 0, // normale Übungsstunden
    special, // Sonderfahrten je Art
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
}

function ensureSeedAdmin(seedEmail) {
  const users = getUsers();
  if (users.some((u) => u.role === 'admin')) return;
  users.push({
    id: crypto.randomUUID(),
    role: 'admin',
    email: normalizeEmail(seedEmail),
    firstName: 'Fahrschule',
    lastName: 'Nusser',
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

function getUpcomingTheorySessions() {
  const now = new Date().toISOString();
  return getTheorySessions().filter((s) => s.startsAt >= now);
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
  return session;
}

function deleteTheorySession(id) {
  saveTheorySessions(getTheorySessions().filter((s) => s.id !== id));
  saveBookings(getBookings().filter((b) => b.sessionId !== id));
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
  if (session.startsAt < new Date().toISOString()) return { error: 'Dieser Termin liegt bereits in der Vergangenheit.' };
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
