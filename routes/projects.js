const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const upload = require('../utils/fileUpload');
const fs = require('fs');
const path = require('path');

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
router.post('/', upload.single('image'), [
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
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, technologies, githubUrl, liveUrl, featured } = req.body;
    
    // Handle technologies string (comma-separated) to array conversion
    const techArray = technologies ? technologies.split(',').map(tech => tech.trim()) : [];
    
    // Get image path if file was uploaded
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const newProject = new Project({
      title,
      description,
      image: imagePath,
      technologies: techArray,
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      featured: featured || false
    });

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
router.put('/:id', upload.single('image'), [
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
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Handle technologies string to array conversion
    if (req.body.technologies) {
      req.body.technologies = req.body.technologies.split(',').map(tech => tech.trim());
    }
    
    // Handle image upload if file was provided
    if (req.file) {
      // Delete old image if it exists
      if (project.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', project.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      req.body.image = `/uploads/${req.file.filename}`;
    }
    
    // Update fields
    const updateFields = {};
    const allowedFields = ['title', 'description', 'image', 'technologies', 'githubUrl', 'liveUrl', 'featured'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

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
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating project' 
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
      message: 'Server error while deleting project' 
    });
  }
});

module.exports = router;
