// const axios = require('axios');

// class PaystackService {
//   constructor() {
//     this.baseURL = 'https://api.paystack.co';
//     this.secretKey = process.env.PAYSTACK_SECRET_KEY;
//   }

//   /**
//    * Initialize a payment transaction
//    */
//   async initializeTransaction(data) {
//     try {
//       const response = await axios.post(
//         `${this.baseURL}/transaction/initialize`,
//         {
//           email: data.email,
//           amount: Math.round(data.amount * 100), // Convert to kobo (smallest currency unit)
//           reference: data.reference,
//           callback_url: data.callbackUrl,
//           metadata: data.metadata || {},
//           channels: data.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${this.secretKey}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Paystack initialization error:', error.response?.data || error.message);
//       throw new Error(error.response?.data?.message || 'Failed to initialize payment');
//     }
//   }

//   /**
//    * Verify a transaction
//    */
//   async verifyTransaction(reference) {
//     try {
//       const response = await axios.get(
//         `${this.baseURL}/transaction/verify/${reference}`,
//         {
//           headers: {
//             Authorization: `Bearer ${this.secretKey}`
//           }
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Paystack verification error:', error.response?.data || error.message);
//       throw new Error(error.response?.data?.message || 'Failed to verify payment');
//     }
//   }

//   /**
//    * Get transaction details
//    */
//   async getTransaction(transactionId) {
//     try {
//       const response = await axios.get(
//         `${this.baseURL}/transaction/${transactionId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${this.secretKey}`
//           }
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Paystack get transaction error:', error.response?.data || error.message);
//       throw new Error('Failed to get transaction details');
//     }
//   }

//   /**
//    * List transactions
//    */
//   async listTransactions(options = {}) {
//     try {
//       const params = new URLSearchParams({
//         perPage: options.perPage || 50,
//         page: options.page || 1,
//         ...(options.customer && { customer: options.customer }),
//         ...(options.status && { status: options.status }),
//         ...(options.from && { from: options.from }),
//         ...(options.to && { to: options.to })
//       });

//       const response = await axios.get(
//         `${this.baseURL}/transaction?${params}`,
//         {
//           headers: {
//             Authorization: `Bearer ${this.secretKey}`
//           }
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Paystack list transactions error:', error.response?.data || error.message);
//       throw new Error('Failed to list transactions');
//     }
//   }

//   /**
//    * Refund a transaction
//    */
//   async refundTransaction(reference, amount = null, merchantNote = '') {
//     try {
//       const payload = {
//         transaction: reference,
//         ...(amount && { amount: Math.round(amount * 100) }),
//         ...(merchantNote && { merchant_note: merchantNote })
//       };

//       const response = await axios.post(
//         `${this.baseURL}/refund`,
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${this.secretKey}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Paystack refund error:', error.response?.data || error.message);
//       throw new Error(error.response?.data?.message || 'Failed to process refund');
//     }
//   }

//   /**
//    * Charge authorization (for recurring payments)
//    */
//   async chargeAuthorization(data) {
//     try {
//       const response = await axios.post(
//         `${this.baseURL}/transaction/charge_authorization`,
//         {
//           authorization_code: data.authorizationCode,
//           email: data.email,
//           amount: Math.round(data.amount * 100),
//           reference: data.reference,
//           metadata: data.metadata || {}
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${this.secretKey}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Paystack charge authorization error:', error.response?.data || error.message);
//       throw new Error('Failed to charge authorization');
//     }
//   }
// }

// module.exports = new PaystackService();





const axios = require('axios');

// Currencies where Paystack uses subunits (multiply by 100)
// These are the "kobo-equivalent" currencies
const SUBUNIT_CURRENCIES = ['NGN', 'GHS', 'KES', 'ZAR', 'USD', 'GBP', 'EUR'];

// Currencies with NO subunits (use amount as-is)
const ZERO_DECIMAL_CURRENCIES = [];

/**
 * Convert amount to smallest currency unit for Paystack API
 * Most currencies: multiply by 100 (e.g. NGN 100 → 10000 kobo)
 */
function toSmallestUnit(amount, currency = 'NGN') {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency)) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

/**
 * Get payment channels based on currency/country
 * International cards only for non-NGN currencies
 */
function getChannels(currency = 'NGN') {
  if (currency === 'NGN') {
    return ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'];
  }
  // For international currencies, only card and bank_transfer are reliable
  return ['card', 'bank_transfer'];
}

class PaystackService {
  constructor() {
    this.baseURL = 'https://api.paystack.co';
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
  }

  /**
   * Initialize a payment transaction
   */
  async initializeTransaction(data) {
    try {
      const currency = data.currency || 'NGN';

      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        {
          email: data.email,
          amount: toSmallestUnit(data.amount, currency),
          currency: currency,
          reference: data.reference,
          callback_url: data.callbackUrl,
          metadata: data.metadata || {},
          channels: data.channels || getChannels(currency)
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize payment');
    }
  }

  /**
   * Verify a transaction
   */
  async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${this.secretKey}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/${transactionId}`,
        {
          headers: { Authorization: `Bearer ${this.secretKey}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Paystack get transaction error:', error.response?.data || error.message);
      throw new Error('Failed to get transaction details');
    }
  }

  /**
   * List transactions
   */
  async listTransactions(options = {}) {
    try {
      const params = new URLSearchParams({
        perPage: options.perPage || 50,
        page: options.page || 1,
        ...(options.customer && { customer: options.customer }),
        ...(options.status   && { status: options.status }),
        ...(options.from     && { from: options.from }),
        ...(options.to       && { to: options.to })
      });

      const response = await axios.get(
        `${this.baseURL}/transaction?${params}`,
        {
          headers: { Authorization: `Bearer ${this.secretKey}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Paystack list transactions error:', error.response?.data || error.message);
      throw new Error('Failed to list transactions');
    }
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(reference, amount = null, currency = 'NGN', merchantNote = '') {
    try {
      const payload = {
        transaction: reference,
        ...(amount && { amount: toSmallestUnit(amount, currency) }),
        ...(merchantNote && { merchant_note: merchantNote })
      };

      const response = await axios.post(
        `${this.baseURL}/refund`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Paystack refund error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to process refund');
    }
  }

  /**
   * Charge authorization (for recurring payments)
   */
  async chargeAuthorization(data) {
    try {
      const currency = data.currency || 'NGN';

      const response = await axios.post(
        `${this.baseURL}/transaction/charge_authorization`,
        {
          authorization_code: data.authorizationCode,
          email: data.email,
          amount: toSmallestUnit(data.amount, currency),
          currency: currency,
          reference: data.reference,
          metadata: data.metadata || {}
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Paystack charge authorization error:', error.response?.data || error.message);
      throw new Error('Failed to charge authorization');
    }
  }
}

module.exports = new PaystackService();