
const getEmailHeader = () => `
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Your E-Commerce Store</h1>
  </div>
`;

const getEmailFooter = () => `
  <div style="background: #f3f4f6; padding: 20px; text-align: center; margin-top: 30px;">
    <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
      Need help? Contact us at support@yourstore.com
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
      © ${new Date().getFullYear()} Your E-Commerce Store. All rights reserved.
    </p>
  </div>
`;

// 1. Welcome Email Template
const getWelcomeEmailTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .content { padding: 30px; }
        .button { 
          display: inline-block; 
          padding: 12px 30px; 
          background: #10b981; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${getEmailHeader()}
        <div class="content">
          <h2 style="color: #10b981;">Welcome to Our Store, ${userName}! 🎉</h2>
          <p>Thank you for joining our community! We're thrilled to have you on board.</p>
          
          <p>Here's what you can do now:</p>
          <ul>
            <li>Browse our latest products</li>
            <li>Add items to your cart</li>
            <li>Enjoy secure checkout with Paystack</li>
            <li>Track your orders in real-time</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL}/products" class="button">Start Shopping</a>
          
          <p>If you have any questions, our support team is here to help!</p>
          
          <p>Happy shopping! 🛍️</p>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
};

// 2. Order Confirmation Email (Customer)
const getOrderConfirmationTemplate = (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        ${item.product?.name || 'Product'}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₦${item.price.toFixed(2)}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
        ₦${(item.quantity * item.price).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .content { padding: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          background: #fef3c7;
          color: #92400e;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${getEmailHeader()}
        <div class="content">
          <h2 style="color: #10b981;">Order Confirmed! ✅</h2>
          <p>Hi ${order.user?.name || 'Customer'},</p>
          <p>Thank you for your order! We've received your payment and are processing it now.</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span class="status-badge">${order.status.toUpperCase()}</span></p>
          </div>
          
          <h3>Order Details:</h3>
          <table>
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #10b981;">
                  ₦${order.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
          
          <h3>Delivery Address:</h3>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <p style="margin: 5px 0;">${order.shippingAddress?.street || 'N/A'}</p>
            <p style="margin: 5px 0;">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}</p>
            <p style="margin: 5px 0;">${order.shippingAddress?.country || ''}</p>
          </div>
          
          <p style="margin-top: 20px;">We'll send you another email when your order ships!</p>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
};

// 3. New Order Alert Email (Admin)
const getAdminOrderNotificationTemplate = (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        ${item.product?.name || 'Product'}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₦${(item.quantity * item.price).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .content { padding: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        ${getEmailHeader()}
        <div class="content">
          <div class="alert">
            <h2 style="color: #dc2626; margin: 0;">🔔 New Order Received!</h2>
          </div>
          
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Customer:</strong> ${order.user?.name || 'N/A'} (${order.user?.email || 'N/A'})</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Total Amount:</strong> <span style="color: #10b981; font-size: 20px; font-weight: bold;">₦${order.totalAmount.toFixed(2)}</span></p>
          
          <h3>Order Items:</h3>
          <table>
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; text-align: left;">Product</th>
                <th style="padding: 8px; text-align: center;">Quantity</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <h3>Shipping Address:</h3>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <p style="margin: 5px 0;">${order.shippingAddress?.street || 'N/A'}</p>
            <p style="margin: 5px 0;">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}</p>
            <p style="margin: 5px 0;">${order.shippingAddress?.country || ''}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
          </div>
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/admin/orders" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View in Admin Panel
            </a>
          </p>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
};

// 4. Password Reset Email
const getPasswordResetTemplate = (userName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .content { padding: 30px; }
        .button { 
          display: inline-block; 
          padding: 12px 30px; 
          background: #10b981; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
        .warning { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        ${getEmailHeader()}
        <div class="content">
          <h2 style="color: #10b981;">Password Reset Request 🔐</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <p style="margin: 0; font-weight: bold;">⚠️ This link will expire in 1 hour.</p>
          </div>
          
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
};

// 5. Order Status Update Email
const getOrderStatusUpdateTemplate = (order, newStatus) => {
  const statusMessages = {
    processing: {
      emoji: '📦',
      title: 'Order is Being Processed',
      message: 'Great news! We\'re now preparing your order for shipment.'
    },
    shipped: {
      emoji: '🚚',
      title: 'Order Has Been Shipped!',
      message: 'Your order is on its way! You should receive it soon.'
    },
    delivered: {
      emoji: '✅',
      title: 'Order Delivered Successfully!',
      message: 'Your order has been delivered. We hope you love your purchase!'
    },
    cancelled: {
      emoji: '❌',
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If you didn\'t request this, please contact support.'
    }
  };

  const status = statusMessages[newStatus] || {
    emoji: '📋',
    title: 'Order Status Updated',
    message: `Your order status has been updated to ${newStatus}.`
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .content { padding: 30px; }
        .status-card {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          margin: 20px 0;
        }
        .button { 
          display: inline-block; 
          padding: 12px 30px; 
          background: #10b981; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${getEmailHeader()}
        <div class="content">
          <h2>Order Update: ${order.orderNumber}</h2>
          <p>Hi ${order.user?.name || 'Customer'},</p>
          
          <div class="status-card">
            <div style="font-size: 48px; margin-bottom: 10px;">${status.emoji}</div>
            <h2 style="margin: 10px 0; color: white;">${status.title}</h2>
            <p style="margin: 10px 0; font-size: 16px;">${status.message}</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₦${order.totalAmount.toFixed(2)}</p>
          </div>
          
          ${newStatus === 'delivered' ? `
            <p>We'd love to hear about your experience! Please consider leaving a review.</p>
          ` : ''}
          
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">View Order Details</a>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getWelcomeEmailTemplate,
  getOrderConfirmationTemplate,
  getAdminOrderNotificationTemplate,
  getPasswordResetTemplate,
  getOrderStatusUpdateTemplate,
};