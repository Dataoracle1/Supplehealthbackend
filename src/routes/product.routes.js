// const express = require('express');
// const { 
//   getProducts, 
//   getProduct
// } = require('../controllers/product.controller');

// const router = express.Router();

// // Public routes
// router.get('/', getProducts);
// router.get('/:id', getProduct);

// module.exports = router;



const express = require('express');
const { 
  getProducts, 
  getProduct
} = require('../controllers/product.controller');

const router = express.Router();

// Public routes
router.get('/', getProducts);

// ✅ Supports both slug (e.g. /vitamin-c) and MongoDB ID
// The controller (getProduct) handles the distinction — see notes below
router.get('/:identifier', getProduct);

module.exports = router;

