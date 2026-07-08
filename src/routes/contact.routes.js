const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  sendContactMessage,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
} = require('../controllers/contact.controller');

// Import your existing auth middleware
const { protect, admin } = require('../middleware/auth.middleware');

// Prevent contact-form spam/flooding: 5 submissions per hour per IP
const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many messages sent. Please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public route - anyone can submit contact form
router.post('/', contactFormLimiter, sendContactMessage);

// Protected admin routes - require authentication and admin role
router.get('/', protect, admin, getAllContacts);
router.get('/:id', protect, admin, getContactById);
router.patch('/:id/status', protect, admin, updateContactStatus);
router.delete('/:id', protect, admin, deleteContact);

module.exports = router;