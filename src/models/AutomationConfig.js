// backend/models/AutomationConfig.js
const mongoose = require('mongoose');

const automationRuleSchema = new mongoose.Schema({
  fromStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
  },
  toStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
  },
  delayHours: {
    type: Number,
    required: true,
    min: 0,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

const automationConfigSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    rules: [automationRuleSchema],
    lastRun: {
      type: Date,
    },
    runInterval: {
      type: Number,
      default: 60, // minutes
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AutomationConfig', automationConfigSchema);