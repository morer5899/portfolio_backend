const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'public/uploads';
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'project-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  
  const error = new Error('Only image files are allowed! (JPEG, PNG, WebP, GIF)');
  error.code = 'LIMIT_FILE_TYPES';
  return cb(error, false);
};

// Initialize upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// Error handling middleware for file uploads
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large. Maximum size is 5MB.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Only one file can be uploaded at a time.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
    return res.status(400).json({ success: false, message });
  } else if (err) {
    // An unknown error occurred
    console.error('File upload error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error uploading file',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
  next();
};

module.exports = { upload, handleUploadErrors };    