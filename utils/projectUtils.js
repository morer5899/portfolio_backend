const { cloudinary } = require('./cloudinary');

// Format Cloudinary image data for project model
const formatProjectImage = (file) => {
  if (!file) return {};
  
  return {
    url: file.secure_url || file.path,
    public_id: file.public_id || file.filename,
    width: file.width,
    height: file.height,
    format: file.format,
    bytes: file.bytes
  };
};

// Delete old image from Cloudinary when updating a project
const deleteOldImage = async (oldImage) => {
  if (!oldImage?.public_id) return;
  
  try {
    await cloudinary.uploader.destroy(oldImage.public_id);
    console.log(`Deleted old image: ${oldImage.public_id}`);
  } catch (error) {
    console.error('Error deleting old image from Cloudinary:', error);
    // Don't throw error, continue with the update
  }
};

module.exports = {
  formatProjectImage,
  deleteOldImage
};
