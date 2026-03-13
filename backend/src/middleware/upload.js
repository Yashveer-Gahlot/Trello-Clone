const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists. Vercel is read-only except for /tmp
const baseDir = process.env.VERCEL ? '/tmp' : process.cwd();
const uploadDir = path.join(baseDir, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using Date.now()
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Create the upload middleware instance with 5MB file limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = { upload };
