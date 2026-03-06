
// const mongoose = require('mongoose');
// const Order = require('../models/Order');
// const Product = require('../models/Product');
// const { 
//   sendOrderConfirmation, 
//   sendOrderStatusUpdate,
//   sendRefundConfirmation 
// } = require('../utils/emailService'); // ✅ NEW: email service

// // @desc    Create new order
// // @route   POST /api/orders
// // @access  Private
// const createOrder = async (req, res) => {
//   try {
//     const {
//       items,
//       shippingAddress,
//       paymentMethod,
//       subtotal,
//       shippingCost,
//       tax,
//       totalAmount
//     } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No order items'
//       });
//     }

//     // Validate products and attach slug to each item ✅ SLUG SUPPORT
//     for (const item of items) {
//       const product = await Product.findById(item.product);

//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: `Product not found: ${item.name}`
//         });
//       }

//       if (!product.isActive) {
//         return res.status(400).json({
//           success: false,
//           message: `Product ${product.name} is no longer available`
//         });
//       }

//       if (product.stock < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
//         });
//       }

//       // Attach slug to the item so order history links work correctly
//       item.slug = product.slug;
//     }

//     // Create order
//     const order = await Order.create({
//       user: req.user._id,
//       items,
//       shippingAddress,
//       paymentMethod,
//       subtotal,
//       shippingCost,
//       tax,
//       totalAmount
//     });

//     // Reduce stock for each product
//     for (const item of items) {
//       await Product.findByIdAndUpdate(item.product, {
//         $inc: { stock: -item.quantity }
//       });
//     }

//     const populatedOrder = await Order.findById(order._id)
//       .populate('user', 'name email')
//       .populate('items.product', 'name images price slug');

//     // ✅ NEW: Send order confirmation email
//     try {
//       await sendOrderConfirmation({
//         to: req.user.email,
//         order: populatedOrder
//       });
//     } catch (emailErr) {
//       // Don't fail the order if email fails — just log it
//       console.error('Order confirmation email failed:', emailErr.message);
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Order created successfully',
//       data: populatedOrder
//     });
//   } catch (error) {
//     console.error('Create order error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error creating order'
//     });
//   }
// };

// // @desc    Get logged in user orders
// // @route   GET /api/orders/my-orders
// // @access  Private
// const getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user._id })
//       .populate('items.product', 'name images price slug') // ✅ slug included
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       count: orders.length,
//       data: orders
//     });
//   } catch (error) {
//     console.error('Get my orders error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error fetching orders'
//     });
//   }
// };

// // @desc    Get order by ID
// // @route   GET /api/orders/:id
// // @access  Private
// const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('user', 'name email phone')
//       .populate('items.product', 'name images price slug'); // ✅ slug included

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to view this order'
//       });
//     }

//     res.json({
//       success: true,
//       data: order
//     });
//   } catch (error) {
//     console.error('Get order by ID error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error fetching order'
//     });
//   }
// };

// // @desc    Track order by tracking number
// // @route   GET /api/orders/track/:trackingNumber
// // @access  Public
// const trackOrder = async (req, res) => {
//   try {
//     const order = await Order.findOne({ trackingNumber: req.params.trackingNumber })
//       .populate('items.product', 'name images slug') // ✅ slug included
//       .select('-user');

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found with this tracking number'
//       });
//     }

//     res.json({
//       success: true,
//       data: {
//         _id: order._id,
//         orderNumber: order.orderNumber,
//         trackingNumber: order.trackingNumber,
//         status: order.status,
//         carrier: order.carrier,
//         estimatedDelivery: order.estimatedDelivery,
//         statusHistory: order.statusHistory,
//         shippingUpdates: order.shippingUpdates,
//         items: order.items,
//         shippingAddress: order.shippingAddress,
//         totalAmount: order.totalAmount,
//         paymentMethod: order.paymentMethod,
//         deliveredAt: order.deliveredAt,
//         createdAt: order.createdAt,
//         updatedAt: order.updatedAt
//       }
//     });
//   } catch (error) {
//     console.error('Track order error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error tracking order'
//     });
//   }
// };

// // @desc    Update order status
// // @route   PUT /api/orders/:id/status
// // @access  Private/Admin
// const updateOrderStatus = async (req, res) => {
//   try {
//     const { status, comment, trackingNumber, carrier, estimatedDelivery, shippingUpdate } = req.body;

//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     if (status) {
//       order.status = status;

//       order.statusHistory.push({
//         status,
//         comment: comment || `Order status updated to ${status}`,
//         updatedAt: Date.now()
//       });

//       if (status === 'paid') {
//         order.isPaid = true;
//         order.paidAt = Date.now();
//       }

//       if (status === 'delivered') {
//         order.isDelivered = true;
//         order.deliveredAt = Date.now();
//       }

//       if (status === 'cancelled') {
//         order.cancelledAt = Date.now();
//         if (comment) order.cancelReason = comment;
//       }
//     }

//     if (trackingNumber) order.trackingNumber = trackingNumber;
//     if (carrier) order.carrier = carrier;
//     if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

//     if (shippingUpdate) {
//       order.shippingUpdates.push({
//         location: shippingUpdate.location,
//         status: shippingUpdate.status,
//         description: shippingUpdate.description,
//         timestamp: shippingUpdate.timestamp || Date.now()
//       });
//     }

//     await order.save();

//     const populatedOrder = await Order.findById(order._id)
//       .populate('user', 'name email phone')
//       .populate('items.product', 'name images price slug'); // ✅ slug included

//     // ✅ NEW: Send status update email for key statuses
//     const emailStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
//     if (status && emailStatuses.includes(status)) {
//       try {
//         await sendOrderStatusUpdate({
//           to: populatedOrder.user.email,
//           order: populatedOrder
//         });
//       } catch (emailErr) {
//         console.error('Status update email failed:', emailErr.message);
//       }
//     }

//     res.json({
//       success: true,
//       message: 'Order updated successfully',
//       data: populatedOrder
//     });
//   } catch (error) {
//     console.error('Update order status error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error updating order'
//     });
//   }
// };

// // @desc    Cancel order
// // @route   PUT /api/orders/:id/cancel
// // @access  Private
// const cancelOrder = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to cancel this order'
//       });
//     }

//     if (!['pending', 'paid'].includes(order.status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot cancel order in current status'
//       });
//     }

//     order.status = 'cancelled';
//     order.cancelledAt = Date.now();
//     order.cancelReason = req.body.reason || 'Cancelled by user';

//     order.statusHistory.push({
//       status: 'cancelled',
//       comment: order.cancelReason,
//       updatedAt: Date.now()
//     });

//     // Restore stock
//     for (const item of order.items) {
//       await Product.findByIdAndUpdate(item.product, {
//         $inc: { stock: item.quantity }
//       });
//     }

//     await order.save();

//     const populatedOrder = await Order.findById(order._id)
//       .populate('user', 'name email')
//       .populate('items.product', 'name images price slug');

//     // ✅ NEW: Send cancellation email
//     try {
//       await sendOrderStatusUpdate({
//         to: populatedOrder.user.email,
//         order: populatedOrder
//       });
//     } catch (emailErr) {
//       console.error('Cancellation email failed:', emailErr.message);
//     }

//     res.json({
//       success: true,
//       message: 'Order cancelled successfully',
//       data: populatedOrder
//     });
//   } catch (error) {
//     console.error('Cancel order error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error cancelling order'
//     });
//   }
// };

// // ✅ NEW: Process refund
// // @desc    Process a refund for an order
// // @route   POST /api/orders/:id/refund
// // @access  Private/Admin
// const processRefund = async (req, res) => {
//   try {
//     const { amount, reason } = req.body;

//     if (!amount || !reason) {
//       return res.status(400).json({
//         success: false,
//         message: 'Refund amount and reason are required'
//       });
//     }

//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     // Only allow refunds on paid or delivered orders
//     if (!['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot refund an order with status: ${order.status}`
//       });
//     }

//     // Prevent over-refunding
//     const alreadyRefunded = order.refunds?.reduce((sum, r) => sum + r.amount, 0) || 0;
//     const remaining = order.totalAmount - alreadyRefunded;

//     if (amount > remaining) {
//       return res.status(400).json({
//         success: false,
//         message: `Refund amount (₦${amount}) exceeds remaining refundable amount (₦${remaining.toFixed(2)})`
//       });
//     }

//     // Record the refund
//     const refund = {
//       amount,
//       reason,
//       processedBy: req.user._id,
//       processedAt: new Date(),
//     };

//     if (!order.refunds) order.refunds = [];
//     order.refunds.push(refund);

//     // If fully refunded, update status
//     const totalRefunded = alreadyRefunded + amount;
//     if (totalRefunded >= order.totalAmount) {
//       order.status = 'refunded';
//       order.statusHistory.push({
//         status: 'refunded',
//         comment: `Full refund of ₦${totalRefunded.toFixed(2)} processed. Reason: ${reason}`,
//         updatedAt: Date.now()
//       });
//     } else {
//       order.statusHistory.push({
//         status: order.status,
//         comment: `Partial refund of ₦${amount} processed. Reason: ${reason}`,
//         updatedAt: Date.now()
//       });
//     }

//     await order.save();

//     const populatedOrder = await Order.findById(order._id)
//       .populate('user', 'name email')
//       .populate('items.product', 'name images price slug');

//     // ✅ NEW: Send refund confirmation email
//     try {
//       await sendRefundConfirmation({
//         to: populatedOrder.user.email,
//         order: populatedOrder,
//         refund
//       });
//     } catch (emailErr) {
//       console.error('Refund email failed:', emailErr.message);
//     }

//     res.json({
//       success: true,
//       message: `Refund of ₦${amount} processed successfully`,
//       data: populatedOrder
//     });
//   } catch (error) {
//     console.error('Process refund error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error processing refund'
//     });
//   }
// };

// // ✅ NEW: Get refund history for an order
// // @desc    Get all refunds for a specific order
// // @route   GET /api/orders/:id/refunds
// // @access  Private/Admin
// const getRefunds = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('user', 'name email')
//       .populate('refunds.processedBy', 'name email');

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     const alreadyRefunded = order.refunds?.reduce((sum, r) => sum + r.amount, 0) || 0;

//     res.json({
//       success: true,
//       data: {
//         orderId: order._id,
//         orderNumber: order.orderNumber,
//         totalAmount: order.totalAmount,
//         totalRefunded: alreadyRefunded,
//         remainingRefundable: order.totalAmount - alreadyRefunded,
//         refunds: order.refunds || []
//       }
//     });
//   } catch (error) {
//     console.error('Get refunds error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error fetching refunds'
//     });
//   }
// };

// module.exports = {
//   createOrder,
//   getMyOrders,
//   getOrderById,
//   trackOrder,
//   updateOrderStatus,
//   cancelOrder,
//   processRefund,   // ✅ NEW
//   getRefunds,      // ✅ NEW
// };




const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendAdminOrderNotification
} = require('../utils/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      totalAmount
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Validate products and check stock
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is no longer available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      // Attach slug so order history links work correctly
      item.slug = product.slug;
    }

    // Generate a unique payment reference for Paystack
    const paymentReference = `SH-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      paymentReference
    });

    // Reduce stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price slug');

    // Send order confirmation email to customer (non-blocking)
    try {
      await sendOrderConfirmationEmail(populatedOrder);
    } catch (emailErr) {
      console.error('Order confirmation email failed:', emailErr.message);
    }

    // Send new order notification to admin (non-blocking)
    try {
      await sendAdminOrderNotification(populatedOrder);
    } catch (emailErr) {
      console.error('Admin order notification failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order'
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images price slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price slug');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order'
    });
  }
};

// @desc    Track order by tracking number
// @route   GET /api/orders/track/:trackingNumber
// @access  Public
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('items.product', 'name images slug')
      .select('-user');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with this tracking number'
      });
    }

    res.json({
      success: true,
      data: {
        _id: order._id,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        status: order.status,
        carrier: order.carrier,
        estimatedDelivery: order.estimatedDelivery,
        statusHistory: order.statusHistory,
        shippingUpdates: order.shippingUpdates,
        items: order.items,
        shippingAddress: order.shippingAddress,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error tracking order'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, comment, trackingNumber, carrier, estimatedDelivery, shippingUpdate } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (status) {
      order.status = status;

      order.statusHistory.push({
        status,
        comment: comment || `Order status updated to ${status}`,
        updatedAt: Date.now()
      });

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
        if (comment) order.cancelReason = comment;
      }
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    if (shippingUpdate) {
      order.shippingUpdates.push({
        location: shippingUpdate.location,
        status: shippingUpdate.status,
        description: shippingUpdate.description,
        timestamp: shippingUpdate.timestamp || Date.now()
      });
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price slug');

    // Send status update email for key statuses (non-blocking)
    const emailStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (status && emailStatuses.includes(status)) {
      try {
        await sendOrderStatusUpdateEmail(populatedOrder, status);
      } catch (emailErr) {
        console.error('Status update email failed:', emailErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancelReason = req.body.reason || 'Cancelled by user';

    order.statusHistory.push({
      status: 'cancelled',
      comment: order.cancelReason,
      updatedAt: Date.now()
    });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price slug');

    // Send cancellation email (non-blocking)
    try {
      await sendOrderStatusUpdateEmail(populatedOrder, 'cancelled');
    } catch (emailErr) {
      console.error('Cancellation email failed:', emailErr.message);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling order'
    });
  }
};

// @desc    Process a refund for an order
// @route   POST /api/orders/:id/refund
// @access  Private/Admin
const processRefund = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount and reason are required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot refund an order with status: ${order.status}`
      });
    }

    // Prevent over-refunding
    const alreadyRefunded = (order.refunds || []).reduce((sum, r) => sum + r.amount, 0);
    const remaining = order.totalAmount - alreadyRefunded;

    if (amount > remaining) {
      return res.status(400).json({
        success: false,
        message: `Refund amount (₦${amount}) exceeds remaining refundable amount (₦${remaining.toFixed(2)})`
      });
    }

    const refund = {
      amount,
      reason,
      processedBy: req.user._id,
      processedAt: new Date()
    };

    if (!order.refunds) order.refunds = [];
    order.refunds.push(refund);

    const totalRefunded = alreadyRefunded + amount;
    if (totalRefunded >= order.totalAmount) {
      order.status = 'refunded';
      order.statusHistory.push({
        status: 'refunded',
        comment: `Full refund of ₦${totalRefunded.toFixed(2)} processed. Reason: ${reason}`,
        updatedAt: Date.now()
      });
    } else {
      order.statusHistory.push({
        status: order.status,
        comment: `Partial refund of ₦${amount} processed. Reason: ${reason}`,
        updatedAt: Date.now()
      });
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price slug');

    // Send refund email (non-blocking)
    try {
      await sendOrderStatusUpdateEmail(populatedOrder, 'refunded');
    } catch (emailErr) {
      console.error('Refund email failed:', emailErr.message);
    }

    res.json({
      success: true,
      message: `Refund of ₦${amount} processed successfully`,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing refund'
    });
  }
};

// @desc    Get all refunds for a specific order
// @route   GET /api/orders/:id/refunds
// @access  Private/Admin
const getRefunds = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('refunds.processedBy', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const totalRefunded = (order.refunds || []).reduce((sum, r) => sum + r.amount, 0);

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        totalRefunded,
        remainingRefundable: order.totalAmount - totalRefunded,
        refunds: order.refunds || []
      }
    });
  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching refunds'
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus,
  cancelOrder,
  processRefund,
  getRefunds
};