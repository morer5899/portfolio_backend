const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../utils/cloudinary');

// Single file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // File uploaded successfully
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        url: req.file.path,
        public_id: req.file.filename,
        format: req.file.format,
        bytes: req.file.size,
        width: req.file.width,
        height: req.file.height,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Delete file
router.delete('/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return res.json({ success: true, message: 'File deleted successfully' });
    }
    
    res.status(404).json({ success: false, message: 'File not found' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
