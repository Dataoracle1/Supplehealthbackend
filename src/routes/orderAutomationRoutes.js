// backend/routes/orderAutomationRoutes.js
const express = require('express');
const router = express.Router();
const orderAutomationController = require('../controllers/orderAutomationController');
const { protect, admin } = require('../middleware/auth.middleware');

// All routes require admin authentication
router.use(protect, admin);

// Get automation configuration
router.get('/config', orderAutomationController.getAutomationConfig);

// Update automation configuration
router.put('/config', orderAutomationController.updateAutomationConfig);

// Toggle automation on/off
router.post('/toggle', orderAutomationController.toggleAutomation);

// Manually trigger automation check
router.post('/trigger', orderAutomationController.triggerAutomation);

// Get pending order progressions
router.get('/pending', orderAutomationController.getPendingProgressions);

// Get automation logs
router.get('/logs', orderAutomationController.getAutomationLogs);

module.exports = router;