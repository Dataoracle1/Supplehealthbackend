const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/database');

// Load environment variables first
dotenv.config();

// ─── Startup env validation ────────────────────────────────────────────────
// Fail fast with a clear message instead of crashing later mid-request or
// silently misbehaving (e.g. JWT signing with 'undefined' as the secret).
const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'PAYSTACK_SECRET_KEY',
  'PAYSTACK_PUBLIC_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'FRONTEND_URL'
];

const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach((key) => console.error(`   - ${key}`));
  console.error('\nCheck your .env file and try again.');
  process.exit(1);
}
// ────────────────────────────────────────────────────────────────────────────

// ─── Optional error tracking (Sentry) ──────────────────────────────────────
// Inactive unless SENTRY_DSN is set AND @sentry/node is installed.
// To enable: npm install @sentry/node, then add SENTRY_DSN to your .env.
let Sentry = null;
if (process.env.SENTRY_DSN) {
  try {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1
    });
    console.log('✅ Sentry error tracking enabled');
  } catch (err) {
    console.warn('⚠️  SENTRY_DSN is set but @sentry/node is not installed. Run: npm install @sentry/node');
  }
}
// ────────────────────────────────────────────────────────────────────────────

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const orderAutomationRoutes = require('./routes/orderAutomationRoutes');
const contactRoutes = require('./routes/contact.routes');
const couponRoutes = require('./routes/coupon.routes');
const cartRoutes = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');

// Import webhook controller (single canonical handler)
const webhookController = require('./controllers/webhookController');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// Sentry must trace requests before other middleware to capture full context
if (Sentry) {
  app.use(Sentry.Handlers.requestHandler());
}

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

// Dynamic sitemap — regenerated on each request so new/removed products
// are always reflected without needing a manual rebuild.
app.get('/sitemap.xml', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const baseUrl = process.env.FRONTEND_URL;

    const products = await Product.find({ isActive: true }).select('slug updatedAt');

    const staticPages = ['', '/shop', '/about', '/contact', '/terms', '/privacy'];

    const urls = [
      ...staticPages.map((path) => `
  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`),
      ...products.map((p) => `
  <url>
    <loc>${baseUrl}/product/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
    ].join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Failed to generate sitemap');
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders/automation', orderAutomationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Sentry must capture the error before the final handler responds
if (Sentry) {
  app.use(Sentry.Handlers.errorHandler());
}

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

const { startAbandonedCartJob } = require('./jobs/abandonedCartJob');
startAbandonedCartJob();

module.exports = server;