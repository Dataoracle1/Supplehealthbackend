const mongoose = require('mongoose');

const abandonedCartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
    type: Boolean,
    default: false
  }
}, { timestamps: true });

abandonedCartSchema.index({ converted: 1, reminderSentAt: 1, updatedAt: 1 });

module.exports = mongoose.model('AbandonedCart', abandonedCartSchema);