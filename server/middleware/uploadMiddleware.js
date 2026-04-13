// =============================================
// Multer Middleware - Handle File Uploads
// =============================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage location and filename
const storage = multer.diskStorage({
  // Save files to the 'uploads' folder in the server directory
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  // Generate a unique filename: fieldname-timestamp.extension
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter: only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // Accept the file
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Create multer instance with settings
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
  fileFilter,
});

module.exports = upload;
