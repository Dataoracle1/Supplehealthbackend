// const Order = require('../models/Order');
// const AutomationLog = require('../models/AutomationLog');
// const { validatePaystackWebhook } = require('../utils/paystackWebhookValidator');
// // const emailService = require('../services/emailService');

// /**
//  * Handle Paystack webhooks
//  */
// exports.paystackWebhook = async (req, res) => {
//   try {
//     // Validate webhook signature
//     if (!validatePaystackWebhook(req)) {
//       console.error('❌ Invalid Paystack webhook signature');
//       return res.status(400).send('Invalid signature');
//     }

//     const event = req.body;
//     console.log('📥 Paystack webhook received:', event.event);

//     // Handle different event types
//     switch (event.event) {
//       case 'charge.success':
//         await handleChargeSuccess(event.data);
//         break;
      
//       case 'charge.failed':
//         await handleChargeFailed(event.data);
//         break;
      
//       case 'refund.processed':
//         await handleRefundProcessed(event.data);
//         break;
      
//       default:
//         console.log(`ℹ️  Unhandled webhook event: ${event.event}`);
//     }

//     res.status(200).send('Webhook received');
//   } catch (error) {
//     console.error('❌ Paystack webhook error:', error);
//     res.status(500).send('Webhook processing failed');
//   }
// };

// /**
//  * Handle successful charge
//  */
// async function handleChargeSuccess(data) {
//   try {
//     const { reference, amount, customer, channel, paid_at, id } = data;

//     // Find order by reference
//     const order = await Order.findOne({ paymentReference: reference }).populate('user');

//     if (!order) {
//       console.error(`❌ Order not found for reference: ${reference}`);
//       return;
//     }

//     // Check if already processed
//     if (order.paymentStatus === 'completed') {
//       console.log(`ℹ️  Order ${order.orderNumber} already marked as paid`);
//       return;
//     }

//     // Update order
//     order.status = 'paid';
//     order.paymentStatus = 'completed';
//     order.paystackData = {
//       ...order.paystackData,
//       transactionId: id,
//       channel: channel,
//       paidAt: new Date(paid_at),
//       gatewayResponse: 'Successful'
//     };
//     order.statusHistory = order.statusHistory || [];
//     order.statusHistory.push({
//       status: 'paid',
//       timestamp: new Date(),
//       triggeredBy: 'webhook'
//     });

//     await order.save();

//     // Log the webhook-triggered update
//     await AutomationLog.create({
//       orderId: order._id,
//       orderNumber: order.orderNumber,
//       fromStatus: 'pending',
//       toStatus: 'paid',
//       triggeredBy: 'webhook',
//       success: true,
//       notificationsSent: { email: false, sms: false }
//     });

//     console.log(`✅ Order ${order.orderNumber} marked as PAID via webhook`);

//     // Send confirmation email
//     // if (order.user?.email) {
//     //   await emailService.sendOrderConfirmation(order.user.email, order);
//     // }
//   } catch (error) {
//     console.error('Error handling charge success:', error);
//   }
// }

// /**
//  * Handle failed charge
//  */
// async function handleChargeFailed(data) {
//   try {
//     const { reference } = data;

//     const order = await Order.findOne({ paymentReference: reference });

//     if (order) {
//       order.paymentStatus = 'failed';
//       await order.save();

//       console.log(`❌ Order ${order.orderNumber} payment failed`);
//     }
//   } catch (error) {
//     console.error('Error handling charge failed:', error);
//   }
// }

// /**
//  * Handle refund processed
//  */
// async function handleRefundProcessed(data) {
//   try {
//     const { transaction_reference, amount } = data;

//     const order = await Order.findOne({ paymentReference: transaction_reference });

//     if (order) {
//       order.refund.status = 'completed';
//       order.paymentStatus = 'refunded';
//       await order.save();

//       console.log(`✅ Refund processed for order ${order.orderNumber}`);
//     }
//   } catch (error) {
//     console.error('Error handling refund processed:', error);
//   }
// }

// module.exports = exports;






const crypto = require('crypto');
const Order = require('../models/Order');
const AutomationLog = require('../models/AutomationLog');
// const emailService = require('../services/emailService');

/**
 * Handle Paystack webhooks
 * NOTE: This route MUST use express.raw() middleware, not express.json()
 * See server.js where this is registered BEFORE body-parsing middleware.
 */
exports.paystackWebhook = async (req, res) => {
  try {
    // Validate webhook signature
    // req.body is a Buffer because express.raw() is used for this route
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(req.body) // Buffer — DO NOT JSON.stringify
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      console.error('❌ Invalid Paystack webhook signature');
      return res.status(400).send('Invalid signature');
    }

    // Parse the body after signature verification
    const event = JSON.parse(req.body.toString());
    console.log('📥 Paystack webhook received:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;

      case 'refund.processed':
        await handleRefundProcessed(event.data);
        break;

      default:
        console.log(`ℹ️  Unhandled webhook event: ${event.event}`);
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('❌ Paystack webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
};

/**
 * Handle successful charge
 */
async function handleChargeSuccess(data) {
  try {
    const { reference, amount, customer, channel, paid_at, id } = data;

    const order = await Order.findOne({ paymentReference: reference }).populate('user');

    if (!order) {
      console.error(`❌ Order not found for reference: ${reference}`);
      return;
    }

    // Already processed — skip
    if (order.paymentStatus === 'completed') {
      console.log(`ℹ️  Order ${order.orderNumber} already marked as paid`);
      return;
    }

    order.status = 'paid';
    order.paymentStatus = 'completed';
    order.isPaid = true;
    order.paidAt = new Date(paid_at);
    order.paystackData = {
      ...order.paystackData,
      transactionId: id,
      channel: channel,
      paidAt: new Date(paid_at),
      gatewayResponse: 'Successful'
    };
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: 'paid',
      comment: 'Payment confirmed via Paystack webhook',
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

    console.log(`✅ Order ${order.orderNumber} marked as PAID via webhook`);

    // TODO: Send confirmation email
    // if (order.user?.email) {
    //   await emailService.sendOrderConfirmationEmail(order);
    // }
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(data) {
  try {
    const { reference } = data;

    const order = await Order.findOne({ paymentReference: reference });

    if (order) {
      order.paymentStatus = 'failed';
      await order.save();
      console.log(`❌ Order ${order.orderNumber} payment failed`);
    }
  } catch (error) {
    console.error('Error handling charge failed:', error);
  }
}

/**
 * Handle refund processed
 */
async function handleRefundProcessed(data) {
  try {
    const { transaction_reference } = data;

    const order = await Order.findOne({ paymentReference: transaction_reference });

    if (order) {
      order.paymentStatus = 'refunded';
      await order.save();
      console.log(`✅ Refund processed for order ${order.orderNumber}`);
    }
  } catch (error) {
    console.error('Error handling refund processed:', error);
  }
}

module.exports = exports;