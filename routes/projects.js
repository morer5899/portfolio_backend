const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { upload, handleUploadErrors } = require('../utils/cloudinary');
const { formatProjectImage, deleteOldImage } = require('../utils/projectUtils');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching projects' 
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching project' 
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin only)
router.post('/', upload.single('image'), handleUploadErrors, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('technologies').optional().isString().withMessage('Technologies must be a string'),
  body('githubUrl').optional().isURL().withMessage('GitHub URL must be valid'),
  body('liveUrl').optional().isURL().withMessage('Live URL must be valid'),
  body('featured').optional().isBoolean().withMessage('Featured must be boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there's a file uploaded but validation failed, delete it
      if (req.file?.public_id) {
        await upload.uploader.destroy(req.file.public_id);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, technologies, githubUrl, liveUrl, featured } = req.body;
    
    // Handle technologies string (comma-separated) to array conversion
    const techArray = technologies ? technologies.split(',').map(tech => tech.trim()) : [];
    
    const projectFields = {
      title,
      description,
      technologies: techArray,
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      featured: featured || false
    };

    // Handle image upload if a new file was provided
    if (req.file) {
      // Format the new image data
      projectFields.image = formatProjectImage(req.file);
    }

    const newProject = new Project(projectFields);

    const project = await newProject.save();
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating project' 
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin only)
router.put('/:id', upload.single('image'), handleUploadErrors, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('technologies').optional().isString().withMessage('Technologies must be a string'),
  body('githubUrl').optional().isURL().withMessage('GitHub URL must be valid'),
  body('liveUrl').optional().isURL().withMessage('Live URL must be valid'),
  body('featured').optional().isBoolean().withMessage('Featured must be boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there's a file uploaded but validation failed, delete it
      if (req.file?.public_id) {
        await upload.uploader.destroy(req.file.public_id);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.findById(req.params.id);
    
    if (!project) {
      // If there's a file uploaded but project not found, delete it
      if (req.file?.public_id) {
        await upload.uploader.destroy(req.file.public_id);
      }
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    const { title, description, technologies, githubUrl, liveUrl, featured } = req.body;
    
    // Prepare update fields
    const updateFields = {};
    
    // Handle each field
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (githubUrl !== undefined) updateFields.githubUrl = githubUrl || '';
    if (liveUrl !== undefined) updateFields.liveUrl = liveUrl || '';
    if (featured !== undefined) updateFields.featured = featured;
    
    // Handle technologies if provided
    if (technologies !== undefined) {
      updateFields.technologies = technologies 
        ? technologies.split(',').map(tech => tech.trim()) 
        : [];
    }
    
    // Handle image upload if a new file was provided
    if (req.file) {
      // Format the new image data
      updateFields.image = formatProjectImage(req.file);
      
      // Delete old image from Cloudinary if it exists
      if (project.image?.public_id) {
        await deleteOldImage(project.image);
      }
    }

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file?.public_id) {
      await upload.uploader.destroy(req.file.public_id);
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Delete the project image from Cloudinary if it exists
    if (project.image?.public_id) {
      try {
        await deleteOldImage(project.image);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with project deletion even if image deletion fails
      }
    }

    // Delete the project from the database
    await Project.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
