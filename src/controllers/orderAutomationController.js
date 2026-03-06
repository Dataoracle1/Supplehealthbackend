const orderAutomationService = require('../services/orderAutomationService');
const AutomationConfig = require('../models/AutomationConfig');
const AutomationLog = require('../models/AutomationLog');

exports.getAutomationConfig = async (req, res) => {
  try {
    const config = await orderAutomationService.getConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching automation config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation config'
    });
  }
};

exports.updateAutomationConfig = async (req, res) => {
  try {
    const config = await orderAutomationService.getConfig();
    
    Object.assign(config, req.body);
    await config.save();

    res.json({
      success: true,
      message: 'Automation config updated',
      data: config
    });
  } catch (error) {
    console.error('Error updating automation config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update automation config'
    });
  }
};

exports.toggleAutomation = async (req, res) => {
  try {
    const { enabled } = req.body;
    const config = await orderAutomationService.getConfig();
    
    config.enabled = enabled;
    await config.save();

    res.json({
      success: true,
      message: `Automation ${enabled ? 'enabled' : 'disabled'}`,
      data: config
    });
  } catch (error) {
    console.error('Error toggling automation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle automation'
    });
  }
};

exports.triggerAutomation = async (req, res) => {
  try {
    const result = await orderAutomationService.processOrderProgression();
    
    res.json({
      success: true,
      message: `Processed ${result.processed} orders`,
      ...result
    });
  } catch (error) {
    console.error('Error triggering automation:', error);
    res.status(500).json({
      success: false,
      message: 'Automation failed'
    });
  }
};

exports.getPendingProgressions = async (req, res) => {
  try {
    const pending = await orderAutomationService.getPendingProgressions();
    
    res.json({
      success: true,
      data: pending
    });
  } catch (error) {
    console.error('Error fetching pending progressions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending progressions'
    });
  }
};

exports.getAutomationLogs = async (req, res) => {
  try {
    const { limit = 50, orderId } = req.query;
    
    const query = orderId ? { orderId } : {};
    const logs = await AutomationLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('orderId', 'orderNumber totalAmount');

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching automation logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation logs'
    });
  }
};