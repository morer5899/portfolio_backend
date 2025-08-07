const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().trim().withMessage('Subject is required'),
  body('message').notEmpty().trim().withMessage('Message is required')
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

    const { name, email, subject, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });

    const contact = await newContact.save();
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message. Please try again later.'
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (Admin only)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status && ['new', 'read', 'replied'].includes(status)) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const contacts = await Contact.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update contact message status (Admin only)
// @access  Private
router.put('/:id/status', [
  body('status').isIn(['new', 'read', 'replied']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating status'
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message (Admin only)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting message'
    });
  }
});

module.exports = router;
