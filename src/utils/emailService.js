

// const nodemailer = require('nodemailer');

// // Create transporter
// const createTransporter = () => {
//   // For development - using Gmail (you can use other services)
//   return nodemailer.createTransporter({
//     service: 'gmail', // or 'hotmail', 'yahoo', etc.
//     auth: {
//       user: process.env.EMAIL_USER, // Your email
//       pass: process.env.EMAIL_PASSWORD // Your app password
//     }
//   });
// };

// // Send verification email
// const sendVerificationEmail = async (email, token, name) => {
//   try {
//     const transporter = createTransporter();
    
//     const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
//     const mailOptions = {
//       from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'Verify Your Email - SuppleHealth',
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .header {
//               background-color: #16a34a;
//               color: white;
//               padding: 20px;
//               text-align: center;
//               border-radius: 5px 5px 0 0;
//             }
//             .content {
//               background-color: #f9f9f9;
//               padding: 30px;
//               border-radius: 0 0 5px 5px;
//             }
//             .button {
//               display: inline-block;
//               background-color: #16a34a;
//               color: white;
//               padding: 12px 30px;
//               text-decoration: none;
//               border-radius: 5px;
//               margin: 20px 0;
//             }
//             .footer {
//               text-align: center;
//               margin-top: 20px;
//               color: #666;
//               font-size: 12px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>Welcome to SuppleHealth!</h1>
//             </div>
//             <div class="content">
//               <h2>Hi ${name},</h2>
//               <p>Thank you for registering with SuppleHealth. Please verify your email address to activate your account.</p>
//               <p>Click the button below to verify your email:</p>
//               <center>
//                 <a href="${verificationUrl}" class="button">Verify Email Address</a>
//               </center>
//               <p>Or copy and paste this link in your browser:</p>
//               <p style="word-break: break-all; color: #16a34a;">${verificationUrl}</p>
//               <p><strong>This link will expire in 24 hours.</strong></p>
//               <p>If you didn't create an account with SuppleHealth, please ignore this email.</p>
//             </div>
//             <div class="footer">
//               <p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Verification email sent to:', email);
//     return true;
//   } catch (error) {
//     console.error('Error sending verification email:', error);
//     throw error;
//   }
// };

// // Send welcome email after verification
// const sendWelcomeEmail = async (email, name) => {
//   try {
//     const transporter = createTransporter();
    
//     const mailOptions = {
//       from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'Welcome to SuppleHealth!',
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .header {
//               background-color: #16a34a;
//               color: white;
//               padding: 20px;
//               text-align: center;
//               border-radius: 5px 5px 0 0;
//             }
//             .content {
//               background-color: #f9f9f9;
//               padding: 30px;
//               border-radius: 0 0 5px 5px;
//             }
//             .button {
//               display: inline-block;
//               background-color: #16a34a;
//               color: white;
//               padding: 12px 30px;
//               text-decoration: none;
//               border-radius: 5px;
//               margin: 20px 0;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>🎉 Account Verified!</h1>
//             </div>
//             <div class="content">
//               <h2>Welcome, ${name}!</h2>
//               <p>Your email has been successfully verified. You can now enjoy full access to SuppleHealth.</p>
//               <center>
//                 <a href="${process.env.FRONTEND_URL}/products" class="button">Start Shopping</a>
//               </center>
//               <p>Thank you for joining our community!</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Welcome email sent to:', email);
//     return true;
//   } catch (error) {
//     console.error('Error sending welcome email:', error);
//     throw error;
//   }
// };

// // Send contact notification to admin
// const sendContactNotification = async ({ name, email, subject, message }) => {
//   try {
//     const transporter = createTransporter();
    
//     const mailOptions = {
//       from: `"SuppleHealth Contact Form" <${process.env.EMAIL_USER}>`,
//       to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
//       subject: `New Contact Form: ${subject}`,
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .header {
//               background-color: #16a34a;
//               color: white;
//               padding: 20px;
//               text-align: center;
//               border-radius: 5px 5px 0 0;
//             }
//             .content {
//               background-color: #f9f9f9;
//               padding: 30px;
//               border-radius: 0 0 5px 5px;
//             }
//             .field {
//               margin-bottom: 15px;
//               padding: 10px;
//               background-color: white;
//               border-radius: 5px;
//             }
//             .label {
//               font-weight: bold;
//               color: #16a34a;
//               display: block;
//               margin-bottom: 5px;
//             }
//             .value {
//               color: #333;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>New Contact Form Submission</h1>
//             </div>
//             <div class="content">
//               <div class="field">
//                 <span class="label">From:</span>
//                 <span class="value">${name}</span>
//               </div>
//               <div class="field">
//                 <span class="label">Email:</span>
//                 <span class="value"><a href="mailto:${email}">${email}</a></span>
//               </div>
//               <div class="field">
//                 <span class="label">Subject:</span>
//                 <span class="value">${subject}</span>
//               </div>
//               <div class="field">
//                 <span class="label">Message:</span>
//                 <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${message}</div>
//               </div>
//               <p style="margin-top: 20px; padding: 15px; background-color: #e0f2e9; border-left: 4px solid #16a34a;">
//                 <strong>Action Required:</strong> Please respond to this customer inquiry within 24 hours.
//               </p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Contact notification sent to admin');
//     return true;
//   } catch (error) {
//     console.error('Error sending contact notification:', error);
//     throw error;
//   }
// };

// // Send auto-reply to customer
// const sendAutoReply = async (email, name) => {
//   try {
//     const transporter = createTransporter();
    
//     const mailOptions = {
//       from: `"SuppleHealth Support" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'We Received Your Message - SuppleHealth',
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .header {
//               background-color: #16a34a;
//               color: white;
//               padding: 20px;
//               text-align: center;
//               border-radius: 5px 5px 0 0;
//             }
//             .content {
//               background-color: #f9f9f9;
//               padding: 30px;
//               border-radius: 0 0 5px 5px;
//             }
//             .button {
//               display: inline-block;
//               background-color: #16a34a;
//               color: white;
//               padding: 12px 30px;
//               text-decoration: none;
//               border-radius: 5px;
//               margin: 20px 0;
//             }
//             .footer {
//               text-align: center;
//               margin-top: 20px;
//               color: #666;
//               font-size: 12px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>Thank You for Contacting Us!</h1>
//             </div>
//             <div class="content">
//               <h2>Hi ${name},</h2>
//               <p>We've received your message and appreciate you reaching out to SuppleHealth.</p>
//               <p>Our support team will review your inquiry and get back to you within <strong>24 hours</strong>.</p>
//               <p>In the meantime, you might find these resources helpful:</p>
//               <ul>
//                 <li><a href="${process.env.FRONTEND_URL}/shop">Browse Our Products</a></li>
//                 <li><a href="${process.env.FRONTEND_URL}/about">Learn About Us</a></li>
//                 <li><a href="${process.env.FRONTEND_URL}/contact">Contact Information</a></li>
//               </ul>
//               <center>
//                 <a href="${process.env.FRONTEND_URL}" class="button">Visit Our Website</a>
//               </center>
//               <p style="margin-top: 30px; padding: 15px; background-color: #e0f2e9; border-left: 4px solid #16a34a;">
//                 <strong>Need Immediate Assistance?</strong><br>
//                 Call us at: +234 800 123 4567<br>
//                 Monday - Friday, 9am - 6pm WAT
//               </p>
//               <p>Best regards,<br><strong>SuppleHealth Support Team</strong></p>
//             </div>
//             <div class="footer">
//               <p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p>
//               <p>This is an automated message. Please do not reply directly to this email.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Auto-reply sent to:', email);
//     return true;
//   } catch (error) {
//     console.error('Error sending auto-reply:', error);
//     throw error;
//   }
// };

// // Send password reset email
// const sendPasswordResetEmail = async (email, resetToken, name) => {
//   try {
//     const transporter = createTransporter();
    
//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
//     const mailOptions = {
//       from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'Password Reset Request - SuppleHealth',
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .header {
//               background-color: #16a34a;
//               color: white;
//               padding: 20px;
//               text-align: center;
//               border-radius: 5px 5px 0 0;
//             }
//             .content {
//               background-color: #f9f9f9;
//               padding: 30px;
//               border-radius: 0 0 5px 5px;
//             }
//             .button {
//               display: inline-block;
//               background-color: #16a34a;
//               color: white;
//               padding: 12px 30px;
//               text-decoration: none;
//               border-radius: 5px;
//               margin: 20px 0;
//             }
//             .warning {
//               background-color: #fef3c7;
//               border-left: 4px solid #f59e0b;
//               padding: 15px;
//               margin: 20px 0;
//             }
//             .footer {
//               text-align: center;
//               margin-top: 20px;
//               color: #666;
//               font-size: 12px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>🔐 Password Reset Request</h1>
//             </div>
//             <div class="content">
//               <h2>Hi ${name},</h2>
//               <p>We received a request to reset your password for your SuppleHealth account.</p>
//               <p>Click the button below to reset your password:</p>
//               <center>
//                 <a href="${resetUrl}" class="button">Reset Password</a>
//               </center>
//               <p>Or copy and paste this link in your browser:</p>
//               <p style="word-break: break-all; color: #16a34a;">${resetUrl}</p>
              
//               <div class="warning">
//                 <strong>⚠️ Important:</strong>
//                 <ul style="margin: 10px 0;">
//                   <li>This link will expire in <strong>1 hour</strong></li>
//                   <li>If you didn't request this, please ignore this email</li>
//                   <li>Your password won't change until you click the link above</li>
//                 </ul>
//               </div>
              
//               <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              
//               <p>Best regards,<br><strong>SuppleHealth Team</strong></p>
//             </div>
//             <div class="footer">
//               <p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Password reset email sent to:', email);
//     return true;
//   } catch (error) {
//     console.error('Error sending password reset email:', error);
//     throw error;
//   }
// };

// // Send password reset confirmation email
// const sendPasswordResetConfirmation = async (email, name) => {
//   try {
//     const transporter = createTransporter();
    
//     const mailOptions = {
//       from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'Password Changed Successfully - SuppleHealth',
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .header {
//               background-color: #16a34a;
//               color: white;
//               padding: 20px;
//               text-align: center;
//               border-radius: 5px 5px 0 0;
//             }
//             .content {
//               background-color: #f9f9f9;
//               padding: 30px;
//               border-radius: 0 0 5px 5px;
//             }
//             .success {
//               background-color: #d1fae5;
//               border-left: 4px solid #16a34a;
//               padding: 15px;
//               margin: 20px 0;
//             }
//             .button {
//               display: inline-block;
//               background-color: #16a34a;
//               color: white;
//               padding: 12px 30px;
//               text-decoration: none;
//               border-radius: 5px;
//               margin: 20px 0;
//             }
//             .footer {
//               text-align: center;
//               margin-top: 20px;
//               color: #666;
//               font-size: 12px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>✅ Password Changed Successfully</h1>
//             </div>
//             <div class="content">
//               <h2>Hi ${name},</h2>
              
//               <div class="success">
//                 <strong>✓ Your password has been changed successfully!</strong>
//               </div>
              
//               <p>This is a confirmation that the password for your SuppleHealth account has been changed.</p>
              
//               <p><strong>Changed on:</strong> ${new Date().toLocaleString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit'
//               })}</p>
              
//               <p>You can now log in with your new password.</p>
              
//               <center>
//                 <a href="${process.env.FRONTEND_URL}/login" class="button">Go to Login</a>
//               </center>
              
//               <p style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
//                 <strong>⚠️ Didn't make this change?</strong><br>
//                 If you didn't change your password, please contact our support team immediately at ${process.env.EMAIL_USER}
//               </p>
              
//               <p>Best regards,<br><strong>SuppleHealth Team</strong></p>
//             </div>
//             <div class="footer">
//               <p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Password reset confirmation sent to:', email);
//     return true;
//   } catch (error) {
//     console.error('Error sending password reset confirmation:', error);
//     throw error;
//   }
// };

// // ✅ NEW: Send order confirmation email (to customer)
// const sendOrderConfirmationEmail = async (order) => {
//   try {
//     const transporter = createTransporter();
    
//     // Build items HTML table
//     const itemsHtml = order.items.map(item => `
//       <tr>
//         <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
//           ${item.product?.name || item.name || 'Product'}
//         </td>
//         <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//           ${item.quantity}
//         </td>
//         <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
//           ₦${item.price.toFixed(2)}
//         </td>
//         <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
//           ₦${(item.quantity * item.price).toFixed(2)}
//         </td>
//       </tr>
//     `).join('');

//     const mailOptions = {
//       from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
//       to: order.user?.email || order.email,
//       subject: `Order Confirmation - ${order.orderNumber} - SuppleHealth`,
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .header {
//               background-color: #16a34a;
//               color: white;
//               padding: 20px;
//               text-align: center;
//               border-radius: 5px 5px 0 0;
//             }
//             .content {
//               background-color: #f9f9f9;
//               padding: 30px;
//               border-radius: 0 0 5px 5px;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               margin: 20px 0;
//               background: white;
//             }
//             .status-badge {
//               display: inline-block;
//               padding: 5px 15px;
//               background: #dcfce7;
//               color: #166534;
//               border-radius: 20px;
//               font-size: 12px;
//               font-weight: bold;
//             }
//             .info-box {
//               background: white;
//               padding: 15px;
//               border-radius: 8px;
//               margin: 15px 0;
//             }
//             .button {
//               display: inline-block;
//               background-color: #16a34a;
//               color: white;
//               padding: 12px 30px;
//               text-decoration: none;
//               border-radius: 5px;
//               margin: 20px 0;
//             }
//             .footer {
//               text-align: center;
//               margin-top: 20px;
//               color: #666;
//               font-size: 12px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>✅ Order Confirmed!</h1>
//             </div>
//             <div class="content">
//               <h2>Hi ${order.user?.name || order.shippingAddress?.fullName || 'Valued Customer'},</h2>
//               <p>Thank you for your order! We've received your payment and are processing it now.</p>
              
//               <div class="info-box">
//                 <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
//                 <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
//                   year: 'numeric', 
//                   month: 'long', 
//                   day: 'numeric' 
//                 })}</p>
//                 <p style="margin: 5px 0;"><strong>Status:</strong> <span class="status-badge">${(order.status || 'PAID').toUpperCase()}</span></p>
//               </div>
              
//               <h3>Order Details:</h3>
//               <table>
//                 <thead>
//                   <tr style="background: #f3f4f6;">
//                     <th style="padding: 10px; text-align: left;">Product</th>
//                     <th style="padding: 10px; text-align: center;">Qty</th>
//                     <th style="padding: 10px; text-align: right;">Price</th>
//                     <th style="padding: 10px; text-align: right;">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   ${itemsHtml}
//                 </tbody>
//                 <tfoot>
//                   <tr>
//                     <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold;">Total:</td>
//                     <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #16a34a;">
//                       ₦${order.totalAmount.toFixed(2)}
//                     </td>
//                   </tr>
//                 </tfoot>
//               </table>
              
//               <h3>Delivery Address:</h3>
//               <div class="info-box">
//                 <p style="margin: 5px 0;">${order.shippingAddress?.street || order.shippingAddress?.address || 'N/A'}</p>
//                 <p style="margin: 5px 0;">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}</p>
//                 <p style="margin: 5px 0;">${order.shippingAddress?.country || 'Nigeria'}</p>
//                 ${order.shippingAddress?.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingAddress.phone}</p>` : ''}
//               </div>
              
//               <center>
//                 <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">Track Your Order</a>
//               </center>
              
//               <p style="margin-top: 20px;">We'll send you another email when your order ships!</p>
              
//               <p>Best regards,<br><strong>SuppleHealth Team</strong></p>
//             </div>
//             <div class="footer">
//               <p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p>
//               <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Order confirmation email sent to:', order.user?.email || order.email);
//     return true;
//   } catch (error) {
//     console.error('Error sending order confirmation email:', error);
//     throw error;
//   }
// };

// // ✅ NEW: Send new order notification (to admin)
// const sendAdminOrderNotification = async (order) => {
//   try {
//     const transporter = createTransporter();
//     const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
//     // Build items HTML
//     const itemsHtml = order.items.map(item => `
//       <tr>
//         <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
//           ${item.product?.name || item.name || 'Product'}
//         </td>
//         <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//           ${item.quantity}
//         </td>
//         <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
//           ₦${(item.quantity * item.price).toFixed(2)}
//         </td>
//       </tr>
//     `).join('');

//     const mailOptions = {
//       from: `"SuppleHealth Orders" <${process.env.EMAIL_USER}>`,
//       to: adminEmail,
//       subject: `🔔 New Order: ${order.orderNumber} - ₦${order.totalAmount.toFixed(2)}`,
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .header {
//               background-color: #16a34a;
//               color: white;
//               padding: 20px;
//               text-align: center;
//               border-radius: 5px 5px 0 0;
//             }
//             .content {
//               background-color: #f9f9f9;
//               padding: 30px;
//               border-radius: 0 0 5px 5px;
//             }
//             .alert {
//               background: #fef2f2;
//               border-left: 4px solid #ef4444;
//               padding: 15px;
//               margin: 20px 0;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               margin: 20px 0;
//               background: white;
//             }
//             .info-box {
//               background: white;
//               padding: 15px;
//               border-radius: 8px;
//               margin: 15px 0;
//             }
//             .button {
//               display: inline-block;
//               background-color: #16a34a;
//               color: white;
//               padding: 12px 24px;
//               text-decoration: none;
//               border-radius: 5px;
//               margin: 20px 0;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>🔔 New Order Received!</h1>
//             </div>
//             <div class="content">
//               <div class="alert">
//                 <h2 style="color: #dc2626; margin: 0;">Action Required</h2>
//                 <p style="margin: 5px 0;">A new order has been placed and requires processing.</p>
//               </div>
              
//               <p><strong>Order Number:</strong> ${order.orderNumber}</p>
//               <p><strong>Customer:</strong> ${order.user?.name || order.shippingAddress?.fullName || 'N/A'} (${order.user?.email || order.email || 'N/A'})</p>
//               <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
//               <p><strong>Total Amount:</strong> <span style="color: #16a34a; font-size: 20px; font-weight: bold;">₦${order.totalAmount.toFixed(2)}</span></p>
              
//               <h3>Order Items:</h3>
//               <table>
//                 <thead>
//                   <tr style="background: #f3f4f6;">
//                     <th style="padding: 8px; text-align: left;">Product</th>
//                     <th style="padding: 8px; text-align: center;">Quantity</th>
//                     <th style="padding: 8px; text-align: right;">Subtotal</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   ${itemsHtml}
//                 </tbody>
//               </table>
              
//               <h3>Shipping Address:</h3>
//               <div class="info-box">
//                 <p style="margin: 5px 0;">${order.shippingAddress?.street || order.shippingAddress?.address || 'N/A'}</p>
//                 <p style="margin: 5px 0;">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}</p>
//                 <p style="margin: 5px 0;">${order.shippingAddress?.country || 'Nigeria'}</p>
//                 <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
//               </div>
              
//               <center>
//                 <a href="${process.env.FRONTEND_URL}/admin/orders" class="button">View in Admin Panel</a>
//               </center>
//             </div>
//           </div>
//         </body>
//         </html>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Admin order notification sent to:', adminEmail);
//     return true;
//   } catch (error) {
//     console.error('Error sending admin order notification:', error);
//     throw error;
//   }
// };

// // ✅ NEW: Send order status update email
// const sendOrderStatusUpdateEmail = async (order, newStatus) => {
//   try {
//     // Only send emails for certain status changes
//    const notifiableStatuses = ['processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
//     if (!notifiableStatuses.includes(newStatus)) {
//       console.log(`ℹ️ Skipping email for status: ${newStatus}`);
//       return { success: true, skipped: true };
//     }

//     const transporter = createTransporter();
    
//     const statusMessages = {
//       processing: {
//         emoji: '📦',
//         title: 'Order is Being Processed',
//         message: 'Great news! We\'re now preparing your order for shipment.',
//         color: '#8b5cf6'
//       },
//       shipped: {
//         emoji: '🚚',
//         title: 'Order Has Been Shipped!',
//         message: 'Your order is on its way! You should receive it soon.',
//         color: '#3b82f6'
//       },
//       delivered: {
//         emoji: '✅',
//         title: 'Order Delivered Successfully!',
//         message: 'Your order has been delivered. We hope you love your purchase!',
//         color: '#16a34a'
//       },
//       cancelled: {
//         emoji: '❌',
//         title: 'Order Cancelled',
//         message: 'Your order has been cancelled. If you didn\'t request this, please contact support.',
//         color: '#ef4444'
//       },
//       refunded: {
//        emoji: '💸',
//        title: 'Refund Processed',
//        message: 'Your refund has been processed. Please allow 3–5 business days for it to appear in your account.',
//        color: '#f59e0b'
//        }
//       };

//     const status = statusMessages[newStatus] || {
//       emoji: '📋',
//       title: 'Order Status Updated',
//       message: `Your order status has been updated to ${newStatus}.`,
//       color: '#6b7280'
//     };

//     const mailOptions = {
//       from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
//       to: order.user?.email || order.email,
//       subject: `Order Update: ${order.orderNumber} - ${status.title}`,
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .header {
//               background-color: #16a34a;
//               color: white;
//               padding: 20px;
//               text-align: center;
//               border-radius: 5px 5px 0 0;
//             }
//             .content {
//               background-color: #f9f9f9;
//               padding: 30px;
//               border-radius: 0 0 5px 5px;
//             }
//             .status-card {
//               background: linear-gradient(135deg, ${status.color} 0%, ${status.color}dd 100%);
//               color: white;
//               padding: 30px;
//               border-radius: 10px;
//               text-align: center;
//               margin: 20px 0;
//             }
//             .info-box {
//               background: white;
//               padding: 15px;
//               border-radius: 8px;
//               margin: 15px 0;
//             }
//             .button {
//               display: inline-block;
//               background-color: #16a34a;
//               color: white;
//               padding: 12px 30px;
//               text-decoration: none;
//               border-radius: 5px;
//               margin: 20px 0;
//             }
//             .footer {
//               text-align: center;
//               margin-top: 20px;
//               color: #666;
//               font-size: 12px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>Order Update</h1>
//             </div>
//             <div class="content">
//               <h2>Hi ${order.user?.name || order.shippingAddress?.fullName || 'Valued Customer'},</h2>
              
//               <div class="status-card">
//                 <div style="font-size: 48px; margin-bottom: 10px;">${status.emoji}</div>
//                 <h2 style="margin: 10px 0; color: white;">${status.title}</h2>
//                 <p style="margin: 10px 0; font-size: 16px;">${status.message}</p>
//               </div>
              
//               <div class="info-box">
//                 <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
//                 <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
//                 <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₦${order.totalAmount.toFixed(2)}</p>
//               </div>
              
//               ${newStatus === 'delivered' ? `
//                 <p style="background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
//                   <strong>💚 Thank you for shopping with SuppleHealth!</strong><br>
//                   We'd love to hear about your experience. Your feedback helps us improve!
//                 </p>
//               ` : ''}
              
//               ${newStatus === 'shipped' ? `
//                 <p style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
//                   <strong>📦 Track your delivery!</strong><br>
//                   Your order is on its way. Expected delivery: 2-5 business days.
//                 </p>
//               ` : ''}
              
//               <center>
//                 <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">View Order Details</a>
//               </center>
              
//               <p>If you have any questions, feel free to contact our support team.</p>
              
//               <p>Best regards,<br><strong>SuppleHealth Team</strong></p>
//             </div>
//             <div class="footer">
//               <p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p>
//               <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Order status update email sent to:', order.user?.email || order.email);
//     return true;
//   } catch (error) {
//     console.error('Error sending order status update email:', error);
//     throw error;
//   }
// };

// module.exports = {
//   sendVerificationEmail,
//   sendWelcomeEmail,
//   sendContactNotification,
//   sendAutoReply,
//   sendPasswordResetEmail,
//   sendPasswordResetConfirmation,
//   sendOrderConfirmationEmail,        // ✅ NEW
//   sendAdminOrderNotification,        // ✅ NEW
//   sendOrderStatusUpdateEmail         // ✅ NEW
// };








const nodemailer = require('nodemailer');

// Create transporter — uses EMAIL_APP_PASSWORD (consistent with emailConfig.js)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

// ─── Verification Email ───────────────────────────────────────────────────────

const sendVerificationEmail = async (email, token, name) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    await transporter.sendMail({
      from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - SuppleHealth',
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background-color:#16a34a;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}
          .content{background-color:#f9f9f9;padding:30px;border-radius:0 0 5px 5px}
          .button{display:inline-block;background-color:#16a34a;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:20px 0}
          .footer{text-align:center;margin-top:20px;color:#666;font-size:12px}
        </style></head><body>
          <div class="container">
            <div class="header"><h1>Welcome to SuppleHealth!</h1></div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering. Please verify your email address to activate your account.</p>
              <center><a href="${verificationUrl}" class="button">Verify Email Address</a></center>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break:break-all;color:#16a34a">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p></div>
          </div>
        </body></html>
      `
    });

    console.log('📧 Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// ─── Welcome Email ────────────────────────────────────────────────────────────

const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to SuppleHealth!',
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background-color:#16a34a;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}
          .content{background-color:#f9f9f9;padding:30px;border-radius:0 0 5px 5px}
          .button{display:inline-block;background-color:#16a34a;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:20px 0}
        </style></head><body>
          <div class="container">
            <div class="header"><h1>🎉 Account Verified!</h1></div>
            <div class="content">
              <h2>Welcome, ${name}!</h2>
              <p>Your email has been successfully verified. You can now enjoy full access to SuppleHealth.</p>
              <center><a href="${process.env.FRONTEND_URL}/shop" class="button">Start Shopping</a></center>
              <p>Thank you for joining our community!</p>
            </div>
          </div>
        </body></html>
      `
    });

    console.log('📧 Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// ─── Contact Notification (to admin) ─────────────────────────────────────────

const sendContactNotification = async ({ name, email, subject, message }) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"SuppleHealth Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background-color:#16a34a;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}
          .content{background-color:#f9f9f9;padding:30px;border-radius:0 0 5px 5px}
          .field{margin-bottom:15px;padding:10px;background-color:white;border-radius:5px}
          .label{font-weight:bold;color:#16a34a;display:block;margin-bottom:5px}
        </style></head><body>
          <div class="container">
            <div class="header"><h1>New Contact Form Submission</h1></div>
            <div class="content">
              <div class="field"><span class="label">From:</span>${name}</div>
              <div class="field"><span class="label">Email:</span><a href="mailto:${email}">${email}</a></div>
              <div class="field"><span class="label">Subject:</span>${subject}</div>
              <div class="field"><span class="label">Message:</span><div style="white-space:pre-wrap">${message}</div></div>
              <p style="padding:15px;background-color:#e0f2e9;border-left:4px solid #16a34a">
                <strong>Action Required:</strong> Please respond to this customer within 24 hours.
              </p>
            </div>
          </div>
        </body></html>
      `
    });

    console.log('📧 Contact notification sent to admin');
    return true;
  } catch (error) {
    console.error('Error sending contact notification:', error);
    throw error;
  }
};

// ─── Auto-Reply (to contact form sender) ─────────────────────────────────────

const sendAutoReply = async (email, name) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"SuppleHealth Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'We Received Your Message - SuppleHealth',
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background-color:#16a34a;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}
          .content{background-color:#f9f9f9;padding:30px;border-radius:0 0 5px 5px}
          .button{display:inline-block;background-color:#16a34a;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:20px 0}
          .footer{text-align:center;margin-top:20px;color:#666;font-size:12px}
        </style></head><body>
          <div class="container">
            <div class="header"><h1>Thank You for Contacting Us!</h1></div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We've received your message and appreciate you reaching out to SuppleHealth.</p>
              <p>Our support team will review your inquiry and get back to you within <strong>24 hours</strong>.</p>
              <center><a href="${process.env.FRONTEND_URL}" class="button">Visit Our Website</a></center>
              <p style="margin-top:30px;padding:15px;background-color:#e0f2e9;border-left:4px solid #16a34a">
                <strong>Need Immediate Assistance?</strong><br>
                Monday - Friday, 9am - 6pm WAT
              </p>
              <p>Best regards,<br><strong>SuppleHealth Support Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p>
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body></html>
      `
    });

    console.log('📧 Auto-reply sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending auto-reply:', error);
    throw error;
  }
};

// ─── Password Reset Email ─────────────────────────────────────────────────────

const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - SuppleHealth',
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background-color:#16a34a;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}
          .content{background-color:#f9f9f9;padding:30px;border-radius:0 0 5px 5px}
          .button{display:inline-block;background-color:#16a34a;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:20px 0}
          .warning{background-color:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0}
          .footer{text-align:center;margin-top:20px;color:#666;font-size:12px}
        </style></head><body>
          <div class="container">
            <div class="header"><h1>🔐 Password Reset Request</h1></div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We received a request to reset your SuppleHealth password.</p>
              <center><a href="${resetUrl}" class="button">Reset Password</a></center>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break:break-all;color:#16a34a">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in <strong>1 hour</strong></li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you click the link above</li>
                </ul>
              </div>
              <p>Best regards,<br><strong>SuppleHealth Team</strong></p>
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p></div>
          </div>
        </body></html>
      `
    });

    console.log('📧 Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// ─── Password Reset Confirmation ──────────────────────────────────────────────

const sendPasswordResetConfirmation = async (email, name) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Changed Successfully - SuppleHealth',
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background-color:#16a34a;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}
          .content{background-color:#f9f9f9;padding:30px;border-radius:0 0 5px 5px}
          .success{background-color:#d1fae5;border-left:4px solid #16a34a;padding:15px;margin:20px 0}
          .button{display:inline-block;background-color:#16a34a;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:20px 0}
          .footer{text-align:center;margin-top:20px;color:#666;font-size:12px}
        </style></head><body>
          <div class="container">
            <div class="header"><h1>✅ Password Changed Successfully</h1></div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <div class="success"><strong>✓ Your password has been changed successfully!</strong></div>
              <p>You can now log in with your new password.</p>
              <center><a href="${process.env.FRONTEND_URL}/login" class="button">Go to Login</a></center>
              <p style="padding:15px;background-color:#fef3c7;border-left:4px solid #f59e0b">
                <strong>⚠️ Didn't make this change?</strong><br>
                Contact our support team immediately at ${process.env.EMAIL_USER}
              </p>
              <p>Best regards,<br><strong>SuppleHealth Team</strong></p>
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p></div>
          </div>
        </body></html>
      `
    });

    console.log('📧 Password reset confirmation sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset confirmation:', error);
    throw error;
  }
};

// ─── Order Confirmation Email (to customer) ───────────────────────────────────

const sendOrderConfirmationEmail = async (order) => {
  try {
    const transporter = createTransporter();

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb">${item.product?.name || item.name || 'Product'}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">${order.currencySymbol || "₦"}${Number(item.price).toFixed(2)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:bold">${order.currencySymbol || "₦"}${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
      to: order.user?.email || order.email,
      subject: `Order Confirmation - ${order.orderNumber} - SuppleHealth`,
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background-color:#16a34a;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}
          .content{background-color:#f9f9f9;padding:30px;border-radius:0 0 5px 5px}
          table{width:100%;border-collapse:collapse;margin:20px 0;background:white}
          .info-box{background:white;padding:15px;border-radius:8px;margin:15px 0}
          .button{display:inline-block;background-color:#16a34a;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:20px 0}
          .footer{text-align:center;margin-top:20px;color:#666;font-size:12px}
        </style></head><body>
          <div class="container">
            <div class="header"><h1>✅ Order Confirmed!</h1></div>
            <div class="content">
              <h2>Hi ${order.user?.name || order.shippingAddress?.name || 'Valued Customer'},</h2>
              <p>Thank you for your order! We've received your payment and are processing it now.</p>
              <div class="info-box">
                <p style="margin:5px 0"><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p style="margin:5px 0"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</p>
                <p style="margin:5px 0"><strong>Status:</strong> ${(order.status || 'pending').toUpperCase()}</p>
              </div>
              <h3>Order Details:</h3>
              <table>
                <thead>
                  <tr style="background:#f3f4f6">
                    <th style="padding:10px;text-align:left">Product</th>
                    <th style="padding:10px;text-align:center">Qty</th>
                    <th style="padding:10px;text-align:right">Price</th>
                    <th style="padding:10px;text-align:right">Total</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding:15px;text-align:right;font-weight:bold">Total:</td>
                    <td style="padding:15px;text-align:right;font-weight:bold;font-size:18px;color:#16a34a">${order.currencySymbol || "₦"}${Number(order.totalAmount).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              <h3>Delivery Address:</h3>
              <div class="info-box">
                <p style="margin:5px 0">${order.shippingAddress?.street || 'N/A'}</p>
                <p style="margin:5px 0">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}</p>
                <p style="margin:5px 0">${order.shippingAddress?.country || 'Nigeria'}</p>
                ${order.shippingAddress?.phone ? `<p style="margin:5px 0"><strong>Phone:</strong> ${order.shippingAddress.phone}</p>` : ''}
              </div>
              <center><a href="${process.env.FRONTEND_URL}/my-orders" class="button">Track Your Order</a></center>
              <p>We'll send you another email when your order ships!</p>
              <p>Best regards,<br><strong>SuppleHealth Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p>
              <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        </body></html>
      `
    });

    console.log('📧 Order confirmation email sent to:', order.user?.email);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// ─── New Order Notification (to admin) ───────────────────────────────────────

const sendAdminOrderNotification = async (order) => {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${item.product?.name || item.name || 'Product'}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${order.currencySymbol || "₦"}${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from: `"SuppleHealth Orders" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🔔 New Order: ${order.orderNumber} - ${order.currencySymbol || "₦"}${Number(order.totalAmount).toFixed(2)}`,
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background-color:#16a34a;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}
          .content{background-color:#f9f9f9;padding:30px;border-radius:0 0 5px 5px}
          .alert{background:#fef2f2;border-left:4px solid #ef4444;padding:15px;margin:20px 0}
          table{width:100%;border-collapse:collapse;margin:20px 0;background:white}
          .info-box{background:white;padding:15px;border-radius:8px;margin:15px 0}
          .button{display:inline-block;background-color:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;margin:20px 0}
        </style></head><body>
          <div class="container">
            <div class="header"><h1>🔔 New Order Received!</h1></div>
            <div class="content">
              <div class="alert"><h2 style="color:#dc2626;margin:0">Action Required</h2><p style="margin:5px 0">A new order has been placed.</p></div>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Customer:</strong> ${order.user?.name || 'N/A'} (${order.user?.email || 'N/A'})</p>
              <p><strong>Total:</strong> <span style="color:#16a34a;font-size:20px;font-weight:bold">${order.currencySymbol || "₦"}${Number(order.totalAmount).toFixed(2)}</span></p>
              <h3>Items:</h3>
              <table>
                <thead><tr style="background:#f3f4f6">
                  <th style="padding:8px;text-align:left">Product</th>
                  <th style="padding:8px;text-align:center">Qty</th>
                  <th style="padding:8px;text-align:right">Subtotal</th>
                </tr></thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <div class="info-box">
                <p style="margin:5px 0">${order.shippingAddress?.street || 'N/A'}</p>
                <p style="margin:5px 0">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}</p>
                <p style="margin:5px 0"><strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
              </div>
              <center><a href="${process.env.FRONTEND_URL}/admin/orders" class="button">View in Admin Panel</a></center>
            </div>
          </div>
        </body></html>
      `
    });

    console.log('📧 Admin order notification sent to:', adminEmail);
    return true;
  } catch (error) {
    console.error('Error sending admin order notification:', error);
    throw error;
  }
};

// ─── Order Status Update Email ────────────────────────────────────────────────

const sendOrderStatusUpdateEmail = async (order, newStatus) => {
  try {
    const notifiableStatuses = ['processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!notifiableStatuses.includes(newStatus)) {
      return { success: true, skipped: true };
    }

    const transporter = createTransporter();

    const statusMessages = {
      processing: { emoji: '📦', title: 'Order is Being Processed', message: "We're now preparing your order for shipment.", color: '#8b5cf6' },
      shipped:    { emoji: '🚚', title: 'Order Has Been Shipped!',   message: 'Your order is on its way!',                     color: '#3b82f6' },
      delivered:  { emoji: '✅', title: 'Order Delivered!',           message: 'Your order has been delivered. Enjoy!',          color: '#16a34a' },
      cancelled:  { emoji: '❌', title: 'Order Cancelled',            message: "Your order was cancelled. Contact support if you didn't request this.", color: '#ef4444' },
      refunded:   { emoji: '💸', title: 'Refund Processed',           message: 'Your refund has been processed. Allow 3–5 business days.',            color: '#f59e0b' }
    };

    const status = statusMessages[newStatus] || { emoji: '📋', title: 'Order Status Updated', message: `Status updated to ${newStatus}.`, color: '#6b7280' };

    await transporter.sendMail({
      from: `"SuppleHealth" <${process.env.EMAIL_USER}>`,
      to: order.user?.email || order.email,
      subject: `Order Update: ${order.orderNumber} - ${status.title}`,
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background-color:#16a34a;color:white;padding:20px;text-align:center;border-radius:5px 5px 0 0}
          .content{background-color:#f9f9f9;padding:30px;border-radius:0 0 5px 5px}
          .status-card{background:${status.color};color:white;padding:30px;border-radius:10px;text-align:center;margin:20px 0}
          .info-box{background:white;padding:15px;border-radius:8px;margin:15px 0}
          .button{display:inline-block;background-color:#16a34a;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:20px 0}
          .footer{text-align:center;margin-top:20px;color:#666;font-size:12px}
        </style></head><body>
          <div class="container">
            <div class="header"><h1>Order Update</h1></div>
            <div class="content">
              <h2>Hi ${order.user?.name || order.shippingAddress?.name || 'Valued Customer'},</h2>
              <div class="status-card">
                <div style="font-size:48px;margin-bottom:10px">${status.emoji}</div>
                <h2 style="margin:10px 0;color:white">${status.title}</h2>
                <p style="margin:10px 0;font-size:16px">${status.message}</p>
              </div>
              <div class="info-box">
                <p style="margin:5px 0"><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p style="margin:5px 0"><strong>Total Amount:</strong> ${order.currencySymbol || "₦"}${Number(order.totalAmount).toFixed(2)}</p>
              </div>
              <center><a href="${process.env.FRONTEND_URL}/my-orders" class="button">View Order Details</a></center>
              <p>If you have any questions, contact our support team.</p>
              <p>Best regards,<br><strong>SuppleHealth Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SuppleHealth. All rights reserved.</p>
              <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        </body></html>
      `
    });

    console.log('📧 Order status update email sent to:', order.user?.email);
    return true;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendContactNotification,
  sendAutoReply,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
  sendOrderStatusUpdateEmail
};