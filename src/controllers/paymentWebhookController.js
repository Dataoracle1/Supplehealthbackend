
const Order = require('../models/Order');
const crypto = require('crypto');

/**
 * Paystack Webhook Handler
 * Automatically updates order status when payment is confirmed
 */
exports.paystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      console.log('⚠️  Invalid Paystack webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      // Find order by payment reference
      const order = await Order.findOne({ paymentReference: reference });

      if (!order) {
        console.log(`⚠️  Order not found for reference: ${reference}`);
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status === 'pending') {
        order.status = 'paid';
        order.paymentStatus = 'paid';
        order.paidAt = new Date();

        if (!order.statusHistory) {
          order.statusHistory = [];
        }
        order.statusHistory.push({
          status: 'paid',
          timestamp: new Date(),
          automated: true,
          note: 'Payment confirmed via Paystack webhook',
        });

        await order.save();

        console.log(`✅ Order ${order.orderNumber} automatically marked as PAID`);

        // TODO: Send confirmation email
        // await emailService.sendPaymentConfirmation(order);
      } else {
        console.log(`ℹ️  Order ${order.orderNumber} already processed (status: ${order.status})`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Paystack webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

module.exports = exports;