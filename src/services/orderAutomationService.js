// backend/services/orderAutomationService.js
const Order = require('../models/Order');
const AutomationConfig = require('../models/AutomationConfig');
const AutomationLog = require('../models/AutomationLog');

class OrderAutomationService {
  /**
   * Get automation configuration
   */
  async getConfig() {
    let config = await AutomationConfig.findOne();
    
    if (!config) {
      // Create default config if none exists
      config = await AutomationConfig.create({
        enabled: false,
        rules: [
          {
            fromStatus: 'paid',
            toStatus: 'processing',
            delayHours: 1,
            enabled: true,
          },
          {
            fromStatus: 'processing',
            toStatus: 'shipped',
            delayHours: 24,
            enabled: true,
          },
          {
            fromStatus: 'shipped',
            toStatus: 'delivered',
            delayHours: 72,
            enabled: true,
          },
        ],
      });
    }
    
    return config;
  }

  /**
   * Update automation configuration
   */
  async updateConfig(updates) {
    let config = await AutomationConfig.findOne();
    
    if (!config) {
      config = await AutomationConfig.create(updates);
    } else {
      Object.assign(config, updates);
      await config.save();
    }
    
    return config;
  }

  /**
   * Toggle automation on/off
   */
  async toggleAutomation(enabled) {
    const config = await this.getConfig();
    config.enabled = enabled;
    await config.save();
    return config;
  }

  /**
   * Get pending order progressions (orders ready to be progressed)
   */
  async getPendingProgressions() {
    const config = await this.getConfig();
    
    if (!config.enabled) {
      return [];
    }

    const pendingProgressions = [];
    
    for (const rule of config.rules) {
      if (!rule.enabled) continue;

      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - rule.delayHours);

      const orders = await Order.find({
        status: rule.fromStatus,
        updatedAt: { $lte: cutoffTime },
      })
      .select('orderNumber status totalAmount updatedAt user')
      .populate('user', 'name email')
      .sort({ updatedAt: 1 });

      for (const order of orders) {
        pendingProgressions.push({
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            currentStatus: order.status,
            totalAmount: order.totalAmount,
            updatedAt: order.updatedAt,
            user: order.user,
          },
          progression: {
            from: rule.fromStatus,
            to: rule.toStatus,
            delayHours: rule.delayHours,
          },
          eligibleSince: order.updatedAt,
        });
      }
    }

    return pendingProgressions;
  }

  /**
   * Find orders eligible for status progression
   */
  async findEligibleOrders() {
    const config = await this.getConfig();
    
    if (!config.enabled) {
      return [];
    }

    const eligibleOrders = [];
    
    for (const rule of config.rules) {
      if (!rule.enabled) continue;

      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - rule.delayHours);

      const orders = await Order.find({
        status: rule.fromStatus,
        updatedAt: { $lte: cutoffTime },
      }).sort({ updatedAt: 1 });

      eligibleOrders.push(
        ...orders.map((order) => ({
          order,
          rule,
        }))
      );
    }

    return eligibleOrders;
  }

  /**
   * Progress an order to the next status
   */
  async progressOrder(orderId, toStatus, automated = true) {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.status;
    order.status = toStatus;

    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: toStatus,
      timestamp: new Date(),
      automated,
      note: automated
        ? `Automatically progressed from ${oldStatus} to ${toStatus}`
        : `Manually progressed from ${oldStatus} to ${toStatus}`,
    });

    await order.save();

    // Log the automation action
    await AutomationLog.create({
      orderId: order._id,
      action: 'status_change',
      fromStatus: oldStatus,
      toStatus: toStatus,
      automated,
      success: true,
    });

    console.log(
      `✅ Order ${order.orderNumber} progressed: ${oldStatus} → ${toStatus} ${
        automated ? '(automated)' : '(manual)'
      }`
    );

    return order;
  }

  /**
   * Process all eligible orders (called by cron job and manual trigger)
   */
  async processOrderProgression() {
    const eligibleOrders = await this.findEligibleOrders();

    const results = {
      processed: 0,
      failed: 0,
      skipped: 0,
      details: [],
    };

    if (eligibleOrders.length === 0) {
      console.log('ℹ️  No orders eligible for progression');
      return results;
    }

    console.log(`🔄 Processing ${eligibleOrders.length} eligible orders...`);

    for (const { order, rule } of eligibleOrders) {
      try {
        await this.progressOrder(order._id, rule.toStatus, true);
        results.processed++;
        results.details.push({
          orderNumber: order.orderNumber,
          orderId: order._id,
          from: rule.fromStatus,
          to: rule.toStatus,
          success: true,
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          orderNumber: order.orderNumber,
          orderId: order._id,
          from: rule.fromStatus,
          to: rule.toStatus,
          success: false,
          error: error.message,
        });
        
        // Log the failed automation
        await AutomationLog.create({
          orderId: order._id,
          action: 'status_change',
          fromStatus: rule.fromStatus,
          toStatus: rule.toStatus,
          automated: true,
          success: false,
          error: error.message,
        });

        console.error(
          `❌ Failed to progress order ${order.orderNumber}: ${error.message}`
        );
      }
    }

    console.log(
      `✅ Automation complete: ${results.processed} processed, ${results.failed} failed`
    );

    return results;
  }
}

module.exports = new OrderAutomationService();