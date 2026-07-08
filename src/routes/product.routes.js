
const express = require('express');
const { 
  getProducts, 
  getProduct,
  addReview
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateReview } = require('../utils/validators');

const router = express.Router();

// Public routes
router.get('/', getProducts);

// ✅ Supports both slug (e.g. /vitamin-c) and MongoDB ID
// The controller (getProduct) handles the distinction — see notes below
router.get('/:identifier', getProduct);

// Reviews — requires login, one review per user per product (handled in controller)
router.post('/:identifier/reviews', protect, validateReview, addReview);

module.exports = router;