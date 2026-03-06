// const crypto = require('crypto');

// /**
//  * Validate Paystack webhook signature
//  */
// const validatePaystackWebhook = (req) => {
//   const hash = crypto
//     .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
//     .update(JSON.stringify(req.body))
//     .digest('hex');

//   return hash === req.headers['x-paystack-signature'];
// };

// module.exports = { validatePaystackWebhook };





const crypto = require('crypto');

/**
 * Validate Paystack webhook signature.
 * req.body must be a raw Buffer (use express.raw() for the webhook route).
 */
const validatePaystackWebhook = (req) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(req.body) // Buffer — DO NOT JSON.stringify
    .digest('hex');

  return hash === req.headers['x-paystack-signature'];
};

module.exports = { validatePaystackWebhook };