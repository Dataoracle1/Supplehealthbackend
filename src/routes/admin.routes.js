// const express = require('express');
// const { 
//   getAllProducts,
//   createProduct, 
//   updateProduct, 
//   deleteProduct
// } = require('../controllers/product.controller'); // ✅ Only import product functions
// const { protect, isAdmin } = require('../middleware/auth.middleware');
// const { validateProduct, validateProductUpdate } = require('../utils/validators');
// const Order = require('../models/Order');

// const router = express.Router();

// // All admin routes require authentication and admin role
// router.use(protect);
// router.use(isAdmin);

// // Admin product management
// router.get('/products', getAllProducts);
// router.post('/products', validateProduct, createProduct);
// router.put('/products/:id', validateProductUpdate, updateProduct); // ✅ This is the key fix!
// router.delete('/products/:id', deleteProduct);

// // Admin order management - GET all orders with optional status filter
// router.get('/orders', async (req, res) => {
//   try {
//     const { status } = req.query;
    
//     let query = {};
//     if (status && status !== 'all' && status !== '') {
//       query.status = status;
//     }
    
//     const orders = await Order.find(query)
//       .populate('user', 'name email phone')
//       .populate('items.product', 'name')
//       .sort({ createdAt: -1 });
    
//     res.json({
//       success: true,
//       data: orders
//     });
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Failed to fetch orders',
//       error: error.message 
//     });
//   }
// });

// // Admin update order status
// router.put('/orders/:id', async (req, res) => {
//   try {
//     const { status, trackingNumber, notes, cancelReason } = req.body;
    
//     const order = await Order.findById(req.params.id);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     if (status) {
//       order.status = status;
//     }
    
//     if (trackingNumber) {
//       order.trackingNumber = trackingNumber;
//     }
    
//     if (notes) {
//       order.notes = notes;
//     }
    
//     if (status === 'paid') {
//       order.isPaid = true;
//       order.paidAt = Date.now();
//     }
    
//     if (status === 'delivered') {
//       order.isDelivered = true;
//       order.deliveredAt = Date.now();
//     }
    
//     if (status === 'cancelled') {
//       order.cancelledAt = Date.now();
//       if (cancelReason) {
//         order.cancelReason = cancelReason;
//       }
//     }
    
//     await order.save();
    
//     res.json({
//       success: true,
//       data: order,
//       message: 'Order status updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Failed to update order status',
//       error: error.message 
//     });
//   }
// });

// // Get dashboard statistics
// router.get('/stats', async (req, res) => {
//   try {
//     const totalOrders = await Order.countDocuments();
//     const pendingOrders = await Order.countDocuments({ status: 'pending' });
//     const processingOrders = await Order.countDocuments({ status: 'processing' });
//     const shippedOrders = await Order.countDocuments({ status: 'shipped' });
//     const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
//     const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
//     const revenueData = await Order.aggregate([
//       { 
//         $match: { 
//           status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } 
//         } 
//       },
//       { 
//         $group: { 
//           _id: null, 
//           total: { $sum: '$totalAmount' } 
//         } 
//       }
//     ]);
    
//     const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
//     const recentOrders = await Order.find()
//       .populate('user', 'name email')
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select('orderNumber totalAmount status createdAt user')
//       .lean();
    
//     res.json({
//       success: true,
//       data: {
//         totalOrders,
//         pendingOrders,
//         processingOrders,
//         shippedOrders,
//         deliveredOrders,
//         cancelledOrders,
//         totalRevenue,
//         recentOrders,
//         totalProducts: 0
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching dashboard stats:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Failed to fetch statistics',
//       error: error.message 
//     });
//   }
// });

// module.exports = router;   


const express = require('express');
const Contact = require('../models/contact.model');
const { 
  getAllProducts,
  createProduct, 
  updateProduct, 
  deleteProduct
} = require('../controllers/product.controller');
const { protect, isAdmin } = require('../middleware/auth.middleware');
const { validateProduct, validateProductUpdate } = require('../utils/validators');
const Order = require('../models/Order');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// ========== PRODUCT MANAGEMENT ==========
router.get('/products', getAllProducts);
router.post('/products', validateProduct, createProduct);
router.put('/products/:id', validateProductUpdate, updateProduct);
router.delete('/products/:id', deleteProduct);

// ========== ORDER MANAGEMENT ==========
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status && status !== 'all' && status !== '') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders',
      error: error.message 
    });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const { status, trackingNumber, notes, cancelReason } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (status) {
      order.status = status;
    }
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    if (notes) {
      order.notes = notes;
    }
    
    if (status === 'paid') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
    
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    if (status === 'cancelled') {
      order.cancelledAt = Date.now();
      if (cancelReason) {
        order.cancelReason = cancelReason;
      }
    }
    
    await order.save();
    
    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update order status',
      error: error.message 
    });
  }
});

// ========== CONTACT MANAGEMENT ==========

// Get all contact messages
router.get('/contacts', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status && status !== 'all' && status !== '') {
      query.status = status;
    }
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message 
    });
  }
});

// Get single contact message
router.get('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    // Mark as read
    if (contact.status === 'unread') {
      contact.status = 'read';
      await contact.save();
    }
    
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch contact message',
      error: error.message 
    });
  }
});

// Update contact status
router.put('/contacts/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    res.json({
      success: true,
      data: contact,
      message: 'Contact status updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update contact status',
      error: error.message 
    });
  }
});

// Delete contact message
router.delete('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    await contact.deleteOne();
    
    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete contact message',
      error: error.message 
    });
  }
});

// ========== DASHBOARD STATISTICS ==========
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    // Contact stats
    const totalContacts = await Contact.countDocuments();
    const unreadContacts = await Contact.countDocuments({ status: 'unread' });
    
    const revenueData = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$totalAmount' } 
        } 
      }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber totalAmount status createdAt user')
      .lean();
    
    // Recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt')
      .lean();
    
    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        totalProducts: 0,
        totalContacts,
        unreadContacts,
        recentOrders,
        recentContacts
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message 
    });
  }
});

module.exports = router;