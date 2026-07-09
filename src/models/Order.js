const mongoose = require('mongoose');

// Supported currencies with their symbols and Paystack support info
const SUPPORTED_CURRENCIES = {
  NGN: { symbol: '₦',   name: 'Nigerian Naira',    paystackSupported: true  },
  USD: { symbol: '$',   name: 'US Dollar',           paystackSupported: true  },
  GBP: { symbol: '£',   name: 'British Pound',       paystackSupported: true  },
  EUR: { symbol: '€',   name: 'Euro',                paystackSupported: false },
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi',      paystackSupported: true  },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling',     paystackSupported: true  },
  ZAR: { symbol: 'R',   name: 'South African Rand',  paystackSupported: true  },
};

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image:    String,
  slug:     String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: { type: String, unique: true },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(items) { return items && items.length > 0; },
      message: 'Order must have at least one item'
    }
  },
  shippingAddress: {
    name:    { type: String, required: true },
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }, // No default — customer must specify
    phone:   { type: String, required: true }
  },
  // Currency for this order (set at checkout based on customer location)
  currency: {
    type: String,
    enum: Object.keys(SUPPORTED_CURRENCIES),
    default: 'NGN'
  },
  // Shipping zone for international pricing logic
  shippingZone: {
    type: String,
    enum: ['domestic', 'west_africa', 'africa', 'international'],
    default: 'domestic'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'paypal', 'bank_transfer', 'cash_on_delivery']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  paymentReference: { type: String, unique: true, sparse: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paystackData: {
    reference:        String,
    accessCode:       String,
    authorizationUrl: String,
    transactionId:    String,
    channel:          String,
    paidAt:           Date,
    gatewayResponse:  String
  },
  subtotal:     { type: Number, required: true, min: 0, default: 0 },
  shippingCost: { type: Number, required: true, min: 0, default: 0 },
  tax:          { type: Number, required: true, min: 0, default: 0 },
  couponCode:      { type: String, default: null },
  discountAmount:  { type: Number, default: 0, min: 0 },
  totalAmount:  { type: Number, required: true, min: 0, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  isPaid:         { type: Boolean, default: false },
  paidAt:         Date,
  isDelivered:    { type: Boolean, default: false },
  deliveredAt:    Date,
  trackingNumber: String,
  notes:          String,
  cancelledAt:    Date,
  cancelReason:   String,
  carrier: {
    type: String,
    enum: ['DHL', 'FedEx', 'UPS', 'USPS', 'EMS', 'Aramex', 'GIG Logistics', 'Local Courier', 'Other', '']
  },
  estimatedDelivery: Date,
  refunds: [{
    amount:      { type: Number, required: true },
    reason:      { type: String, required: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date, default: Date.now }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    },
    comment:   String,
    updatedAt: { type: Date, default: Date.now }
  }],
  shippingUpdates: [{
    location:    String,
    status:      String,
    description: String,
    timestamp:   { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  // Mongoose sets isNew=false internally before post-save hooks run,
  // so we snapshot it here for the post-save hook below to use.
  this.wasNew = this.isNew;

  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}-${Math.floor(Math.random() * 1000)}`;
  }
  if (this.isModified('status') && this.status === 'shipped' && !this.trackingNumber) {
    this.trackingNumber = 'TRK-' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory = [{ status: this.status, comment: 'Order placed successfully', updatedAt: Date.now() }];
  }
  next();
});

// A real order landing means the cart was NOT abandoned — clear/mark the
// saved snapshot so the recovery job doesn't email someone who already bought.
// Decoupled from the order controller on purpose so this stays correct
// regardless of which code path creates the order (checkout, admin, etc).
orderSchema.post('save', async function(doc) {
  if (doc.wasNew) {
    try {
      const AbandonedCart = mongoose.model('AbandonedCart');
      await AbandonedCart.findOneAndDelete({ user: doc.user });
    } catch (error) {
      console.error('Failed to clear abandoned cart snapshot:', error.message);
    }
  }
});

orderSchema.virtual('itemsCount').get(function() {
  if (!this.items || !Array.isArray(this.items)) return 0;
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Returns the correct currency symbol for email templates and receipts
orderSchema.virtual('currencySymbol').get(function() {
  return (SUPPORTED_CURRENCIES[this.currency] || SUPPORTED_CURRENCIES.NGN).symbol;
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
module.exports.SUPPORTED_CURRENCIES = SUPPORTED_CURRENCIES;