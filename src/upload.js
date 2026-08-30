// Handles catalog photo uploads (multipart form data) and saves them under
// public/uploads so they're served as plain static files at /uploads/...
//
// IMPORTANT: on most hosting platforms (Render's free tier included) the
// filesystem is ephemeral - anything written here is wiped on the next
// deploy or restart unless a persistent disk is attached. See the README
// for details before relying on this for real catalog photos.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed.'));
}

const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('photo');

// Wraps multer's callback style so routes can just do
// `await handleUpload(req, res)` and catch upload errors (wrong file type,
// too large) as a normal thrown error instead of a raw multer callback.
function handleUpload(req, res) {
  return new Promise((resolve, reject) => {
    uploadPhoto(req, res, (err) => (err ? reject(err) : resolve()));
  });
}

module.exports = { handleUpload };
