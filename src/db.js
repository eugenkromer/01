// Tiny JSON-file data layer. No database server required - each collection
// lives in its own file under /data. Fine for a small single-instance site;
// if the business outgrows this, swap this module for a real database
// without touching the routes (they only call the functions below).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readJSON(name, fallback) {
  try {
    const raw = fs.readFileSync(filePath(name), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

function writeJSON(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

// ---------- Users (admin / viewer) ----------

function getUsers() {
  return readJSON('users', []);
}

function saveUsers(users) {
  writeJSON('users', users);
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return getUsers().find((u) => u.email.toLowerCase() === normalized) || null;
}

function getAdminUser() {
  return getUsers().find((u) => u.role === 'admin') || null;
}

function upsertUser(email, role) {
  const normalized = email.trim().toLowerCase();
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === normalized);
  if (existing) {
    existing.role = role;
  } else {
    users.push({ email: normalized, role });
  }
  saveUsers(users);
}

function ensureSeedUser(seedEmail) {
  const users = getUsers();
  if (users.length === 0) {
    saveUsers([{ email: seedEmail.trim().toLowerCase(), role: 'admin' }]);
  }
}

// ---------- Catalog items ----------

function getItems() {
  return readJSON('items', []);
}

function saveItems(items) {
  writeJSON('items', items);
}

function getItem(id) {
  return getItems().find((i) => i.id === id) || null;
}

function createItem(data) {
  const items = getItems();
  const now = new Date().toISOString();
  const item = {
    id: crypto.randomUUID(),
    category: data.category.trim(),
    name: data.name.trim(),
    description: data.description ? data.description.trim() : '',
    dimensions: data.dimensions ? data.dimensions.trim() : '',
    price: Number(data.price) || 0,
    priceUnit: data.priceUnit ? data.priceUnit.trim() : 'each',
    stock: Number.isFinite(Number(data.stock)) ? Number(data.stock) : 0,
    imageUrl: data.imageUrl ? data.imageUrl.trim() : '',
    createdAt: now,
    updatedAt: now,
  };
  items.push(item);
  saveItems(items);
  return item;
}

function updateItem(id, data) {
  const items = getItems();
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  item.category = data.category.trim();
  item.name = data.name.trim();
  item.description = data.description ? data.description.trim() : '';
  item.dimensions = data.dimensions ? data.dimensions.trim() : '';
  item.price = Number(data.price) || 0;
  item.priceUnit = data.priceUnit ? data.priceUnit.trim() : 'each';
  item.stock = Number.isFinite(Number(data.stock)) ? Number(data.stock) : 0;
  item.imageUrl = data.imageUrl ? data.imageUrl.trim() : '';
  item.updatedAt = new Date().toISOString();
  saveItems(items);
  return item;
}

function deleteItem(id) {
  const items = getItems().filter((i) => i.id !== id);
  saveItems(items);
}

function ensureSeedItems() {
  const items = getItems();
  if (items.length > 0) return;
  const sample = [
    {
      category: 'Tables',
      name: '60" Round Table',
      description: 'Classic round banquet table, seats 8.',
      dimensions: '60 in diameter',
      price: 12,
      priceUnit: 'per event',
      stock: 20,
      imageUrl: '',
    },
    {
      category: 'Tables',
      name: '8 ft Rectangular Table',
      description: 'Standard banquet table, seats 8-10.',
      dimensions: '96 x 30 in',
      price: 14,
      priceUnit: 'per event',
      stock: 15,
      imageUrl: '',
    },
    {
      category: 'Chairs',
      name: 'Chiavari Chair - Gold',
      description: 'Elegant Chiavari chair, a timeless wedding classic.',
      dimensions: '',
      price: 4,
      priceUnit: 'each',
      stock: 200,
      imageUrl: '',
    },
    {
      category: 'Chairs',
      name: 'Chiavari Chair - White',
      description: 'Elegant Chiavari chair in white.',
      dimensions: '',
      price: 4,
      priceUnit: 'each',
      stock: 200,
      imageUrl: '',
    },
    {
      category: 'Tableware',
      name: 'Flatware Set',
      description: 'Fork, knife, and spoon set, polished stainless steel.',
      dimensions: '',
      price: 1.5,
      priceUnit: 'per set',
      stock: 300,
      imageUrl: '',
    },
    {
      category: 'Decor',
      name: 'Floral Arch',
      description: 'Wooden arch for ceremonies, decorate with your own florals or add ours.',
      dimensions: '7 ft tall',
      price: 60,
      priceUnit: 'per event',
      stock: 4,
      imageUrl: '',
    },
  ];
  for (const s of sample) createItem(s);
}

// ---------- Quote requests ----------

function getRequests() {
  return readJSON('requests', []);
}

function saveRequests(requests) {
  writeJSON('requests', requests);
}

function createRequest(data) {
  const requests = getRequests();
  const request = {
    id: crypto.randomUUID(),
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    eventDate: data.eventDate || '',
    message: data.message || '',
    items: data.items || [],
    createdAt: new Date().toISOString(),
  };
  requests.unshift(request);
  saveRequests(requests);
  return request;
}

// ---------- Login & handover tokens ----------

function getTokens() {
  return readJSON('tokens', []);
}

function saveTokens(tokens) {
  writeJSON('tokens', tokens);
}

function pruneExpiredTokens() {
  const now = Date.now();
  const tokens = getTokens().filter((t) => new Date(t.expiresAt).getTime() > now);
  saveTokens(tokens);
}

function createToken({ type, email, fromEmail, ttlMs }) {
  const tokens = getTokens();
  const token = {
    token: crypto.randomBytes(24).toString('hex'),
    type, // 'login' | 'transfer'
    email, // for login: the account logging in; for transfer: the invited new admin
    fromEmail: fromEmail || null, // for transfer: who initiated it
    status: type === 'transfer' ? 'pending' : undefined,
    used: false,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
  };
  tokens.push(token);
  saveTokens(tokens);
  return token;
}

function findValidToken(tokenValue, type) {
  const token = getTokens().find((t) => t.token === tokenValue && t.type === type);
  if (!token) return null;
  if (new Date(token.expiresAt).getTime() < Date.now()) return null;
  if (type === 'login' && token.used) return null;
  if (type === 'transfer' && token.status !== 'pending') return null;
  return token;
}

function markLoginTokenUsed(tokenValue) {
  const tokens = getTokens();
  const token = tokens.find((t) => t.token === tokenValue && t.type === 'login');
  if (token) {
    token.used = true;
    saveTokens(tokens);
  }
}

function markTransferAccepted(tokenValue) {
  const tokens = getTokens();
  const token = tokens.find((t) => t.token === tokenValue && t.type === 'transfer');
  if (token) {
    token.status = 'accepted';
    token.acceptedAt = new Date().toISOString();
    saveTokens(tokens);
  }
  return token;
}

function getPendingTransferFor(fromEmail) {
  const normalized = fromEmail.trim().toLowerCase();
  return (
    getTokens().find(
      (t) => t.type === 'transfer' && t.status === 'pending' && t.fromEmail.toLowerCase() === normalized
    ) || null
  );
}

module.exports = {
  ensureSeedUser,
  ensureSeedItems,
  findUserByEmail,
  getAdminUser,
  upsertUser,
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getRequests,
  createRequest,
  createToken,
  findValidToken,
  markLoginTokenUsed,
  markTransferAccepted,
  getPendingTransferFor,
  pruneExpiredTokens,
};
