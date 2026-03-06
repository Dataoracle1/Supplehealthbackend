const express = require('express');
const { 
  createOrder, 
  getMyOrders, 
  getOrderById,
  trackOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/order.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { validateOrder } = require('../utils/validators');

const router = express.Router();

// ✅ PUBLIC ROUTE - Track order by tracking number (before protect middleware)
router.get('/track/:trackingNumber', trackOrder);

// All other order routes require authentication
router.use(protect);

// User routes
router.post('/', validateOrder, createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// ✅ ADMIN ROUTE - Update order status
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;