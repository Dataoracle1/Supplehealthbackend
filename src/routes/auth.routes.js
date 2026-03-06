// const express = require('express');
// const {
//   register,
//   login,
//   getMe,
//   verifyEmail,
//   resendVerificationEmail,
//   forgotPassword,      
//   resetPassword        
// } = require('../controllers/auth.controller');
// const { protect } = require('../middleware/auth.middleware');

// const router = express.Router();

// router.post('/register', register);
// router.post('/login', login);
// router.get('/me', protect, getMe);
// router.get('/verify-email/:token', verifyEmail);
// router.post('/resend-verification', resendVerificationEmail);
// router.post('/forgot-password', forgotPassword);       
// router.post('/reset-password/:token', resetPassword);  
// module.exports = router;








const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Login: 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Register: 5 accounts per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many accounts created from this IP. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Forgot password: 5 requests per hour (prevents email bombing)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Resend verification: 3 requests per hour
const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many verification email requests. Please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, resendVerificationEmail);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;