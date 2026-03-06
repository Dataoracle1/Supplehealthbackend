

/**
 * Initialize Paystack Payment
 * @param {Object} config - Payment configuration
 * @param {number} config.amount - Amount in Naira (will be converted to kobo)
 * @param {string} config.email - Customer email
 * @param {string} config.reference - Unique payment reference
 * @param {Function} config.onSuccess - Callback on successful payment
 * @param {Function} config.onClose - Callback when popup is closed
 */
export const initializePaystackPayment = (config) => {
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!paystackPublicKey) {
    console.error('Paystack public key not found in environment variables');
    alert('Payment configuration error. Please contact support.');
    return;
  }

  // Check if PaystackPop is loaded
  if (typeof window.PaystackPop === 'undefined') {
    console.error('Paystack script not loaded');
    alert('Payment system is loading. Please try again in a moment.');
    return;
  }

  const handler = window.PaystackPop.setup({
    key: paystackPublicKey,
    email: config.email,
    amount: Math.round(config.amount * 100), // Convert Naira to kobo (smallest currency unit)
    currency: 'NGN',
    ref: config.reference,
    metadata: {
      custom_fields: config.metadata || []
    },
    callback: function(response) {
      console.log('Payment successful:', response);
      if (config.onSuccess) {
        config.onSuccess(response);
      }
    },
    onClose: function() {
      console.log('Payment popup closed');
      if (config.onClose) {
        config.onClose();
      }
    }
  });

  handler.openIframe();
};

/**
 * Generate unique payment reference
 */
export const generatePaymentReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `SH-${timestamp}-${random}`;
};

/**
 * Load Paystack inline script
 */
export const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window.PaystackPop !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
  });
};