const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { username, password } = req.body;

    // Check credentials against environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const payload = {
      admin: {
        username: adminUsername
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          message: 'Login successful',
          token,
          expiresIn: '24h'
        });
      }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/admin/verify
// @desc    Verify admin token
// @access  Private
router.post('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    res.json({
      success: true,
      message: 'Token is valid',
      admin: decoded.admin
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.admin = decoded.admin;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const Project = require('../models/Project');
    const Contact = require('../models/Contact');

    const [projectCount, contactCount, recentProjects, recentContacts] = await Promise.all([
      Project.countDocuments(),
      Contact.countDocuments(),
      Project.find().sort({ createdAt: -1 }).limit(5),
      Contact.find().sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          projects: projectCount,
          contacts: contactCount
        },
        recentProjects,
        recentContacts
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

module.exports = router;
