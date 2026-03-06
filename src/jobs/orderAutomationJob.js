// backend/jobs/orderAutomationJob.js
const cron = require('node-cron');
const orderAutomationService = require('../services/orderAutomationService');

let cronJob = null;

/**
 * Start the order automation cron job
 * Runs every hour to check for orders that need status progression
 */
function startOrderAutomation() {
  // Run every hour at minute 0
  // Cron format: minute hour day month weekday
  cronJob = cron.schedule('0 * * * *', async () => {
    try {
      console.log('🤖 Running order automation check...');
      const result = await orderAutomationService.processOrderProgression();
      
      if (result.processed > 0 || result.failed > 0) {
        console.log(
          `✅ Order automation completed: ${result.processed} processed, ${result.failed} failed`
        );
      }
    } catch (error) {
      console.error('❌ Order automation error:', error);
    }
  });

  console.log('🤖 Order automation cron job scheduled (runs every hour)');
}

/**
 * Stop the cron job
 */
function stopOrderAutomation() {
  if (cronJob) {
    cronJob.stop();
    console.log('⏹️  Order automation cron job stopped');
  }
}

module.exports = {
  startOrderAutomation,
  stopOrderAutomation,
};