
// const Product = require('../models/Product');
// const Order = require('../models/Order');
// const User = require('../models/User');
// const Contact = require('../models/contact.model'); // ← ADD THIS
// const cloudinary = require('../config/cloudinary');

// // ========== PRODUCT MANAGEMENT ==========
// // ... your existing product functions ...

// // ========== ORDER MANAGEMENT ==========
// // ... your existing order functions ...

// // ========== CONTACT MANAGEMENT ========== ← ADD THIS SECTION

// // @desc    Get all contact messages
// // @route   GET /api/admin/contacts
// // @access  Private/Admin
// const getAllContacts = async (req, res) => {
//   try {
//     const { status } = req.query;
    
//     let query = {};
//     if (status && status !== 'all') {
//       query.status = status;
//     }

//     const contacts = await Contact.find(query)
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       count: contacts.length,
//       data: contacts
//     });
//   } catch (error) {
//     console.error('Get all contacts error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error fetching contacts'
//     });
//   }
// };

// // @desc    Get single contact message
// // @route   GET /api/admin/contacts/:id
// // @access  Private/Admin
// const getContactById = async (req, res) => {
//   try {
//     const contact = await Contact.findById(req.params.id);

//     if (!contact) {
//       return res.status(404).json({
//         success: false,
//         message: 'Contact message not found'
//       });
//     }

//     // Mark as read
//     if (contact.status === 'unread') {
//       contact.status = 'read';
//       await contact.save();
//     }

//     res.json({
//       success: true,
//       data: contact
//     });
//   } catch (error) {
//     console.error('Get contact error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error fetching contact'
//     });
//   }
// };

// // @desc    Update contact status
// // @route   PUT /api/admin/contacts/:id/status
// // @access  Private/Admin
// const updateContactStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }

//     const contact = await Contact.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true, runValidators: true }
//     );

//     if (!contact) {
//       return res.status(404).json({
//         success: false,
//         message: 'Contact message not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: contact
//     });
//   } catch (error) {
//     console.error('Update contact status error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error updating contact'
//     });
//   }
// };

// // @desc    Delete contact message
// // @route   DELETE /api/admin/contacts/:id
// // @access  Private/Admin
// const deleteContact = async (req, res) => {
//   try {
//     const contact = await Contact.findById(req.params.id);

//     if (!contact) {
//       return res.status(404).json({
//         success: false,
//         message: 'Contact message not found'
//       });
//     }

//     await contact.deleteOne();

//     res.json({
//       success: true,
//       message: 'Contact message deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete contact error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error deleting contact'
//     });
//   }
// };

// // @desc    Get dashboard stats
// // @route   GET /api/admin/stats
// // @access  Private/Admin
// const getDashboardStats = async (req, res) => {
//   try {
//     const totalOrders = await Order.countDocuments();
//     const pendingOrders = await Order.countDocuments({ status: 'pending' });
//     const totalProducts = await Product.countDocuments();
//     const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
//     const totalUsers = await User.countDocuments();
//     const unreadContacts = await Contact.countDocuments({ status: 'unread' }); // ← ADD THIS

//     // Calculate total revenue
//     const orders = await Order.find({ isPaid: true });
//     const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

//     // Recent orders
//     const recentOrders = await Order.find()
//       .populate('user', 'name email')
//       .populate('items.product', 'name images')
//       .sort({ createdAt: -1 })
//       .limit(5);

//     // Recent contacts ← ADD THIS
//     const recentContacts = await Contact.find()
//       .sort({ createdAt: -1 })
//       .limit(5);

//     res.json({
//       success: true,
//       data: {
//         totalOrders,
//         pendingOrders,
//         totalProducts,
//         lowStockProducts,
//         totalUsers,
//         unreadContacts, // ← ADD THIS
//         totalRevenue,
//         recentOrders,
//         recentContacts // ← ADD THIS
//       }
//     });
//   } catch (error) {
//     console.error('Get dashboard stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error fetching stats'
//     });
//   }
// };

// module.exports = {
//   createProduct,
//   updateProduct,
//   deleteProduct,
//   getAllProducts,
//   getAllOrders,
//   updateOrderStatus,
//   getDashboardStats,
//   // ← ADD THESE
//   getAllContacts,
//   getContactById,
//   updateContactStatus,
//   deleteContact
// };






const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Contact = require('../models/contact.model');
const cloudinary = require('../config/cloudinary');

// ========== PRODUCT MANAGEMENT ==========

// @desc    Get all products (including inactive)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products'
    });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(image.publicId);
          } catch (cloudinaryError) {
            console.error('Cloudinary deletion error:', cloudinaryError);
            // Continue even if cloudinary deletion fails
          }
        }
      }
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting product'
    });
  }
};

// ========== ORDER MANAGEMENT ==========

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status || order.status;
    order.trackingNumber = trackingNumber || order.trackingNumber;
    order.notes = notes || order.notes;

    if (status === 'paid' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    if (status === 'delivered' && !order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order'
    });
  }
};

// ========== CONTACT MANAGEMENT ==========

// @desc    Get all contact messages
// @route   GET /api/admin/contacts
// @access  Private/Admin
const getAllContacts = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const contacts = await Contact.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contacts'
    });
  }
};

// @desc    Get single contact message
// @route   GET /api/admin/contacts/:id
// @access  Private/Admin
const getContactById = async (req, res) => {
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
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contact'
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/admin/contacts/:id/status
// @access  Private/Admin
const updateContactStatus = async (req, res) => {
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
      data: contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating contact'
    });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/admin/contacts/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
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
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting contact'
    });
  }
};

// ========== DASHBOARD ==========

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
    const totalUsers = await User.countDocuments();
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
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt');

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalProducts,
        lowStockProducts,
        totalUsers,
        totalContacts,
        unreadContacts,
        totalRevenue,
        recentOrders,
        recentContacts
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching stats'
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
};