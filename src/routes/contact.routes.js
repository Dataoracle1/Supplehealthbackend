

const express = require('express');
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

// Public route - anyone can submit contact form
router.post('/', sendContactMessage);

// Protected admin routes - require authentication and admin role
router.get('/', protect, admin, getAllContacts);
router.get('/:id', protect, admin, getContactById);
router.patch('/:id/status', protect, admin, updateContactStatus);
router.delete('/:id', protect, admin, deleteContact);

module.exports = router;