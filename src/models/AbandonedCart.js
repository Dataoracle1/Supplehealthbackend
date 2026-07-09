const mongoose = require('mongoose');

const abandonedCartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // one active saved cart per user
  },
  email: {
    type: String,
    required: true
  },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     String,
    price:    Number,
    quantity: Number,
    image:    String
  }],
  reminderSentAt: {
    type: Date,
    default: null
  },
  converted: {
    // set true once the user checks out — kept briefly for reporting, then cleaned up
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Query pattern used by the recovery job: idle carts, not yet reminded, not converted
abandonedCartSchema.index({ converted: 1, reminderSentAt: 1, updatedAt: 1 });

module.exports = mongoose.model('AbandonedCart', abandonedCartSchema);