// const Order = require('../models/Order');
// const paystackService = require('../services/paystackService');
// const AutomationLog = require('../models/AutomationLog');

// /**
//  * Initialize payment for an order
//  */
// exports.initializePayment = async (req, res) => {
//   try {
//     const { orderId } = req.body;

//     // Find the order
//     const order = await Order.findById(orderId).populate('user');
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     // Check if already paid
//     if (order.paymentStatus === 'completed') {
//       return res.status(400).json({
//         success: false,
//         message: 'Order already paid'
//       });
//     }

//     // Initialize Paystack transaction
//     const paystackResponse = await paystackService.initializeTransaction({
//       email: order.user.email,
//       amount: order.totalAmount,
//       reference: order.paymentReference,
//       callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
//       metadata: {
//         orderId: order._id.toString(),
//         orderNumber: order.orderNumber,
//         customerName: order.user.name,
//         customerPhone: order.shippingAddress?.phone
//       }
//     });

//     // Update order with Paystack data
//     order.paystackData = {
//       reference: paystackResponse.data.reference,
//       accessCode: paystackResponse.data.access_code,
//       authorizationUrl: paystackResponse.data.authorization_url
//     };
//     order.paymentStatus = 'processing';
    
//     await order.save();

//     res.json({
//       success: true,
//       message: 'Payment initialized',
//       data: {
//         authorizationUrl: paystackResponse.data.authorization_url,
//         accessCode: paystackResponse.data.access_code,
//         reference: paystackResponse.data.reference
//       }
//     });
//   } catch (error) {
//     console.error('Initialize payment error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to initialize payment'
//     });
//   }
// };

// /**
//  * Verify payment after callback
//  */
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { reference } = req.params;

//     // Find order by reference
//     const order = await Order.findOne({ paymentReference: reference }).populate('user');
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     // Verify with Paystack
//     const verification = await paystackService.verifyTransaction(reference);

//     if (verification.data.status === 'success') {
//       // Update order
//       order.status = 'paid';
//       order.paymentStatus = 'completed';
//       order.paystackData = {
//         ...order.paystackData,
//         transactionId: verification.data.id,
//         channel: verification.data.channel,
//         paidAt: new Date(verification.data.paid_at),
//         gatewayResponse: verification.data.gateway_response
//       };
//       order.statusHistory = order.statusHistory || [];
//       order.statusHistory.push({
//         status: 'paid',
//         timestamp: new Date(),
//         triggeredBy: 'payment_verification'
//       });

//       await order.save();

//       // Log the payment
//       await AutomationLog.create({
//         orderId: order._id,
//         orderNumber: order.orderNumber,
//         fromStatus: 'pending',
//         toStatus: 'paid',
//         triggeredBy: 'webhook',
//         success: true
//       });

//       // TODO: Send confirmation email
//       // await emailService.sendOrderConfirmation(order.user.email, order);

//       res.json({
//         success: true,
//         message: 'Payment verified successfully',
//         data: {
//           orderId: order._id,
//           orderNumber: order.orderNumber,
//           status: order.status,
//           paymentStatus: order.paymentStatus
//         }
//       });
//     } else {
//       // Payment failed
//       order.paymentStatus = 'failed';
//       await order.save();

//       res.status(400).json({
//         success: false,
//         message: 'Payment verification failed',
//         data: verification.data
//       });
//     }
//   } catch (error) {
//     console.error('Verify payment error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to verify payment'
//     });
//   }
// };

// /**
//  * Get payment status
//  */
// exports.getPaymentStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const order = await Order.findById(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: {
//         paymentStatus: order.paymentStatus,
//         status: order.status,
//         paymentReference: order.paymentReference,
//         paystackData: order.paystackData
//       }
//     });
//   } catch (error) {
//     console.error('Get payment status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get payment status'
//     });
//   }
// };

// /**
//  * Process refund
//  */
// exports.processRefund = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { amount, reason } = req.body;

//     const order = await Order.findById(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     if (order.paymentStatus !== 'completed') {
//       return res.status(400).json({
//         success: false,
//         message: 'Order payment not completed'
//       });
//     }

//     // Process refund with Paystack
//     const refundResponse = await paystackService.refundTransaction(
//       order.paymentReference,
//       amount || order.totalAmount,
//       reason
//     );

//     // Update order
//     order.refund = {
//       status: 'completed',
//       amount: amount || order.totalAmount,
//       reason: reason,
//       refundedAt: new Date(),
//       transactionId: refundResponse.data.id
//     };
//     order.paymentStatus = 'refunded';
//     order.status = 'cancelled';

//     await order.save();

//     res.json({
//       success: true,
//       message: 'Refund processed successfully',
//       data: refundResponse.data
//     });
//   } catch (error) {
//     console.error('Process refund error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to process refund'
//     });
//   }
// };





const Order = require('../models/Order');
const { SUPPORTED_CURRENCIES } = require('../models/Order');
const paystackService = require('../services/paystackService');
const AutomationLog = require('../models/AutomationLog');

/**
 * Initialize payment for an order
 * @route POST /api/payment/initialize
 */
exports.initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    const currency = order.currency || 'NGN';
    const currencyInfo = SUPPORTED_CURRENCIES[currency];

    // Check if Paystack supports this currency
    if (!currencyInfo?.paystackSupported) {
      return res.status(400).json({
        success: false,
        message: `Payment in ${currency} is not currently supported. Please contact support.`
      });
    }

    // Initialize Paystack transaction with the order's currency
    const paystackResponse = await paystackService.initializeTransaction({
      email: order.user.email,
      amount: order.totalAmount,
      currency: currency,
      reference: order.paymentReference,
      callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        currency: currency,
        customerName: order.user.name,
        customerPhone: order.shippingAddress?.phone,
        shippingCountry: order.shippingAddress?.country,
        shippingZone: order.shippingZone
      }
    });

    // Store Paystack auth data on the order
    order.paystackData = {
      reference: paystackResponse.data.reference,
      accessCode: paystackResponse.data.access_code,
      authorizationUrl: paystackResponse.data.authorization_url
    };
    order.paymentStatus = 'processing';

    await order.save();

    res.json({
      success: true,
      message: 'Payment initialized',
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
        currency: currency,
        currencySymbol: currencyInfo.symbol
      }
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to initialize payment' });
  }
};

/**
 * Verify payment after Paystack callback
 * @route GET /api/payment/verify/:reference
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const order = await Order.findOne({ paymentReference: reference }).populate('user');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const verification = await paystackService.verifyTransaction(reference);

    if (verification.data.status === 'success') {
      order.status = 'paid';
      order.paymentStatus = 'completed';
      order.isPaid = true;
      order.paidAt = new Date(verification.data.paid_at);
      order.paystackData = {
        ...order.paystackData,
        transactionId: verification.data.id,
        channel: verification.data.channel,
        paidAt: new Date(verification.data.paid_at),
        gatewayResponse: verification.data.gateway_response
      };
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: 'paid',
        comment: 'Payment verified via Paystack callback',
        updatedAt: new Date()
      });

      await order.save();

      await AutomationLog.create({
        orderId: order._id,
        action: 'status_change',
        fromStatus: 'pending',
        toStatus: 'paid',
        automated: true,
        success: true
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          currency: order.currency
        }
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: verification.data
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to verify payment' });
  }
};

/**
 * Get payment status for an order
 * @route GET /api/payment/status/:orderId
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const currencyInfo = SUPPORTED_CURRENCIES[order.currency] || SUPPORTED_CURRENCIES.NGN;

    res.json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        status: order.status,
        paymentReference: order.paymentReference,
        currency: order.currency,
        currencySymbol: currencyInfo.symbol,
        paystackData: order.paystackData
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payment status' });
  }
};

/**
 * Process refund for an order
 * @route POST /api/payment/refund/:orderId
 */
exports.processRefund = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'completed') {
      return res.status(400).json({ success: false, message: 'Order payment not completed' });
    }

    const refundAmount = amount || order.totalAmount;
    const currency = order.currency || 'NGN';

    const refundResponse = await paystackService.refundTransaction(
      order.paymentReference,
      refundAmount,
      currency,
      reason
    );

    order.refunds = order.refunds || [];
    order.refunds.push({
      amount: refundAmount,
      reason: reason || 'Refund requested',
      processedAt: new Date()
    });
    order.paymentStatus = 'refunded';
    order.status = 'refunded';
    order.statusHistory.push({
      status: 'refunded',
      comment: `Refund of ${order.currencySymbol}${refundAmount} processed. Reason: ${reason}`,
      updatedAt: Date.now()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: refundResponse.data
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process refund' });
  }
};