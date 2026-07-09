const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: [0, 'Discount value cannot be negative']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscountAmount: {
    // caps a percentage discount so it can't exceed a fixed ceiling (e.g. "20% off, max ₦5000")
    type: Number,
    default: null
  },
  maxUses: {
    // total redemptions across all customers; null = unlimited
    type: Number,
    default: null,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  maxUsesPerUser: {
    type: Number,
    default: 1,
    min: 1
  },
  expiresAt: {
    type: Date,
    default: null // null = never expires
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Validate a coupon's usability. Does NOT check per-user usage — that check
// requires looking at the Order collection and is done in the controller.
couponSchema.methods.isUsable = function(orderTotal) {
  if (!this.isActive) return { valid: false, reason: 'This coupon is no longer active' };
  if (this.expiresAt && this.expiresAt < new Date()) return { valid: false, reason: 'This coupon has expired' };
  if (this.maxUses !== null && this.usedCount >= this.maxUses) return { valid: false, reason: 'This coupon has reached its usage limit' };
  if (orderTotal < this.minOrderAmount) {
    return { valid: false, reason: `This coupon requires a minimum order of ${this.minOrderAmount}` };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function(orderTotal) {
  let discount = this.discountType === 'percentage'
    ? (orderTotal * this.discountValue) / 100
    : this.discountValue;

  if (this.maxDiscountAmount !== null) {
    discount = Math.min(discount, this.maxDiscountAmount);
  }

  // Never discount more than the order is worth
  return Math.min(discount, orderTotal);
};

module.exports = mongoose.model('Coupon', couponSchema);