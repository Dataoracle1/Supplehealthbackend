const mongoose = require('mongoose');

// ─── Slug Helper ───────────────────────────────────────────────────────────────
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')   // remove special characters
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-');           // collapse multiple hyphens
}
// ──────────────────────────────────────────────────────────────────────────────

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },

  // ✅ NEW: Slug field
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },

  description: {
    type: String,
    required: [true, 'Product description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be at least 0.01']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Vitamins', 'Minerals', 'Proteins', 'Immunity', 'Energy', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  images: {
    type: [{
      url: { type: String, required: true },
      publicId: String,
      alt: String
    }],
    validate: {
      validator: function(images) {
        return images && images.length > 0;
      },
      message: 'Product must have at least one image'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  servingSize: String,
  servingsPerContainer: {
    type: Number,
    min: [1, 'Servings per container must be at least 1']
  },
  ingredients: [String],
  benefits: [String],
  usage: String,
  warnings: String,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 }
  },
  reviews: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:      { type: String, required: true }, // snapshot in case user is deleted later
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [String],
  brand: String,
  weight: String,
}, {
  timestamps: true
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: -1, createdAt: -1 });

// Virtuals
productSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock < 10) return 'low_stock';
  return 'in_stock';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// ✅ Pre-save: auto-generate slug + SKU
productSchema.pre('save', async function(next) {
  const Product = mongoose.model('Product');

  // Auto-generate SKU
  if (this.isNew && !this.sku) {
    const count = await Product.countDocuments();
    this.sku = `SUP-${Date.now()}-${count + 1}`;
  }

  // Auto-generate slug from name (on create, or if name changed)
  if (this.isNew || this.isModified('name')) {
    let baseSlug = generateSlug(this.name);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique — append a number if needed (e.g. "vitamin-c-2")
    while (await Product.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);