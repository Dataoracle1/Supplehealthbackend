// backend/jobs/abandonedCartJob.js
const cron = require('node-cron');
const AbandonedCart = require('../models/AbandonedCart');
const transporter = require('../config/emailConfig');
const { getAbandonedCartTemplate } = require('../utils/emailTemplates');

const IDLE_HOURS_BEFORE_REMINDER = 2; // cart untouched for this long → eligible
const CLEANUP_AFTER_DAYS = 14;        // stop tracking (converted or not) after this long

let cronJob = null;

async function processAbandonedCarts() {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - IDLE_HOURS_BEFORE_REMINDER);

  const eligibleCarts = await AbandonedCart.find({
    converted: false,
    reminderSentAt: null,
    updatedAt: { $lte: cutoff },
    'items.0': { $exists: true } // has at least one item
  });

  let sent = 0;
  let failed = 0;

  for (const cart of eligibleCarts) {
    try {
      await transporter.sendMail({
        from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
        to: cart.email,
        subject: 'You left something in your cart 🛒',
        html: getAbandonedCartTemplate(cart.email.split('@')[0], cart.items)
      });

      cart.reminderSentAt = new Date();
      await cart.save();
      sent++;
    } catch (error) {
      console.error(`❌ Failed to send abandoned cart email for ${cart.email}:`, error.message);
      failed++;
    }
  }

  if (sent > 0 || failed > 0) {
    console.log(`🛒 Abandoned cart job: ${sent} reminders sent, ${failed} failed`);
  }

  // Housekeeping: remove old records so the collection doesn't grow forever
  const cleanupCutoff = new Date();
  cleanupCutoff.setDate(cleanupCutoff.getDate() - CLEANUP_AFTER_DAYS);
  await AbandonedCart.deleteMany({ updatedAt: { $lte: cleanupCutoff } });
}

function startAbandonedCartJob() {
  // Runs every 30 minutes
  cronJob = cron.schedule('*/30 * * * *', async () => {
    try {
      await processAbandonedCarts();
    } catch (error) {
      console.error('❌ Abandoned cart job error:', error);
    }
  });

  console.log('🛒 Abandoned cart recovery job scheduled (runs every 30 minutes)');
}

function stopAbandonedCartJob() {
  if (cronJob) {
    cronJob.stop();
    console.log('⏹️  Abandoned cart job stopped');
  }
}

module.exports = { startAbandonedCartJob, stopAbandonedCartJob, processAbandonedCarts };