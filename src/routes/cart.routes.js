const express = require('express');
const { saveCart } = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/save', protect, saveCart);

module.exports = router;