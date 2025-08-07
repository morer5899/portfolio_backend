const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    minlength: [10, 'Description must be at least 10 characters long']
  },
  image: {
    url: {
      type: String,
      default: ''
    },
    public_id: {
      type: String,
      default: ''
    },
    width: Number,
    height: Number,
    format: String,
    bytes: Number
  },
  technologies: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    default: '',
    match: [/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/, 'Please use a valid URL with HTTP or HTTPS']
  },
  liveUrl: {
    type: String,
    default: '',
    match: [/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/, 'Please use a valid URL with HTTP or HTTPS']
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt field before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add a method to get a thumbnail URL (if needed)
projectSchema.methods.getThumbnailUrl = function() {
  if (!this.image?.url) return '';
  // You can add Cloudinary transformations here if needed
  return this.image.url;
};

// Add a method to get image metadata
projectSchema.methods.getImageMeta = function() {
  if (!this.image?.url) return null;
  return {
    url: this.image.url,
    width: this.image.width,
    height: this.image.height,
    format: this.image.format,
    size: this.image.bytes
  };
};

// Add a static method to get featured projects
projectSchema.statics.getFeatured = function() {
  return this.find({ featured: true })
    .sort({ createdAt: -1 })
    .limit(6);
};

// Add text index for search functionality
projectSchema.index({
  title: 'text',
  description: 'text',
  technologies: 'text'
});

module.exports = mongoose.model('Project', projectSchema);
