// backend/models/AutomationLog.js
const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['status_change', 'notification_sent', 'error'],
    },
    fromStatus: {
      type: String,
    },
    toStatus: {
      type: String,
    },
    automated: {
      type: Boolean,
      default: true,
    },
    success: {
      type: Boolean,
      default: true,
    },
    error: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
automationLogSchema.index({ orderId: 1, createdAt: -1 });
automationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AutomationLog', automationLogSchema);