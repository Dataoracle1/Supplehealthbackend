const express = require('express');
const rateLimit = require('express-rate-limit');
const { validateCoupon } = require('../controllers/coupon.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Prevent brute-forcing coupon codes: 20 attempts per 15 minutes
const validateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many coupon attempts. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Any logged-in user can validate a coupon at checkout
router.post('/validate', protect, validateLimiter, validateCoupon);

module.exports = router;