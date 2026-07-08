
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/database');

// Load environment variables first
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const orderAutomationRoutes = require('./routes/orderAutomationRoutes');
const contactRoutes = require('./routes/contact.routes');

// Import webhook controller (single canonical handler)
const webhookController = require('./controllers/webhookController');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    const uniqueOrigins = [...new Set(allowedOrigins)];

    if (!origin) return callback(null, true);

    if (uniqueOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// IMPORTANT: Webhook MUST come before express.json()
// Paystack needs the raw Buffer body for HMAC signature verification
app.post(
  '/api/webhooks/paystack',
  express.raw({ type: 'application/json' }),
  webhookController.paystackWebhook
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NoSQL injection sanitization
// Strips $ and . from req.body, req.query, req.params
// Blocks attacks like: { "email": { "$gt": "" } }
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Database
connectDB();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders/automation', orderAutomationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});

// Start order automation cron job
const { startOrderAutomation } = require('./jobs/orderAutomationJob');
startOrderAutomation();

module.exports = server;