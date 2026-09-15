// Kleine Formathelfer, die in den Views gebraucht werden.

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function parse(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// "Montag, 21. September 2026"
function formatDate(value) {
  const date = parse(value);
  if (!date) return '';
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// "21.09.2026"
function formatDateShort(value) {
  const date = parse(value);
  if (!date) return '';
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

// "18:00"
function formatTime(value) {
  const date = parse(value);
  if (!date) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())} Uhr`;
}

// "21.09.2026, 18:00 Uhr"
function formatDateTime(value) {
  const date = parse(value);
  if (!date) return '';
  return `${formatDateShort(value)}, ${formatTime(value)}`;
}

// Für den value eines <input type="datetime-local">
function toInputValue(value) {
  const date = parse(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatEuro(value) {
  if (value === null || value === undefined || value === '') return '';
  return `${Number(value).toFixed(2).replace('.', ',')} €`;
}

module.exports = {
  formatDate,
  formatDateShort,
  formatTime,
  formatDateTime,
  toInputValue,
  formatEuro,
};
