const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
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
      shippingCost = 0,
      tax = 0,
      couponCode,
      paymentReference: clientPaymentReference
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Validate products, check stock, and rebuild each line item from trusted
    // database values. We NEVER trust price/name/image submitted by the
    // client here — only the product ID and requested quantity. Without this,
    // a tampered request could set any price it wants for any product.
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name || item.product}`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is no longer available`
        });
      }

      const quantity = Number(item.quantity);
      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}`
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      verifiedItems.push({
        product: product._id,
        name: product.name,
        price: product.price, // trusted DB price, not the client-submitted one
        quantity,
        image: product.images?.[0]?.url || '',
        slug: product.slug
      });

      subtotal += product.price * quantity;
    }

    // Recalculate/validate any applied coupon server-side. We never trust a
    // client-submitted discountAmount directly — it's recomputed here from
    // the coupon's own rules against the server-verified subtotal.
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const preDiscountTotal = subtotal + Number(shippingCost) + Number(tax);
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });

      if (coupon) {
        const usability = coupon.isUsable(preDiscountTotal);
        const userUsageCount = await Order.countDocuments({
          user: req.user._id,
          couponCode: coupon.code,
          status: { $ne: 'cancelled' }
        });

        if (usability.valid && userUsageCount < coupon.maxUsesPerUser) {
          discountAmount = coupon.calculateDiscount(preDiscountTotal);
          appliedCouponCode = coupon.code;
        }
        // If the coupon is no longer valid (expired / limit hit in the few
        // seconds since checkout validated it), we silently drop the discount
        // rather than failing the whole order — it still goes through at
        // full price instead of blocking the customer's purchase.
      }
    }

    const totalAmount = Math.max(
      0,
      subtotal + Number(shippingCost) + Number(tax) - discountAmount
    );

    // Generate a unique payment reference for Paystack
    // For card payments, Checkout.jsx generates a reference BEFORE opening
    // the Paystack popup and charges against that exact value — Paystack's
    // webhook later reports that same reference back. If we generated a
    // different one here, the webhook's Order.findOne({ paymentReference })
    // lookup would never match, and card payments would never auto-confirm.
    // For flows with no pre-existing reference (shouldn't normally happen,
    // since the frontend always sends one), fall back to generating one.
    const paymentReference =
      clientPaymentReference || `SH-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: verifiedItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost: Number(shippingCost),
      tax: Number(tax),
      couponCode: appliedCouponCode,
      discountAmount,
      totalAmount,
      paymentReference
    });

    // Reduce stock for each product
    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Record the coupon redemption
    if (appliedCouponCode) {
      await Coupon.findOneAndUpdate(
        { code: appliedCouponCode },
        { $inc: { usedCount: 1 } }
      );
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