const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { auth, admin } = require('../middleware/auth');

// Rate limiting for login attempts
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: { 
    success: false, 
    message: 'Too many login attempts. Please try again after 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', loginLimiter, [
  body('username').trim().notEmpty().withMessage('Username is required'),
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
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const payload = {
      user: {
        id: 'admin',
        username: adminUsername,
        role: 'admin'
      }
    };

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    try {
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Set secure cookie with token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          username: adminUsername,
          role: 'admin'
        },
        expiresIn: '24h'
      });
    } catch (err) {
      console.error('JWT signing error:', err);
      throw err; // This will be caught by the outer try-catch
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/admin/check-auth
// @desc    Check if user is authenticated and get user info
// @access  Private (requires valid token)
router.get('/check-auth', auth, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication check'
    });
  }
});

// @route   POST /api/admin/logout
// @desc    Logout admin (clear token)
// @access  Private
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', auth, admin, async (req, res) => {
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
