
const mongoose = require('mongoose'); // ✅ ADDED: needed for ObjectId check
const Product = require('../models/Product');

// @desc    Get all products (with optional filters)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Build sort
    let sortOptions = {};
    if (sort === 'price-asc') sortOptions.price = 1;
    else if (sort === 'price-desc') sortOptions.price = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
    else if (sort === 'name-asc') sortOptions.name = 1;
    else if (sort === 'name-desc') sortOptions.name = -1;
    else sortOptions.createdAt = -1; // Default
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products'
    });
  }
};

// @desc    Get single product by slug OR by ID
// @route   GET /api/products/:identifier
// @access  Public
// ✅ UPDATED: now supports both /api/products/vitamin-c and /api/products/64f1a2b3...
const getProduct = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Check if the param looks like a MongoDB ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

    const product = isObjectId
      ? await Product.findById(identifier)
      : await Product.findOne({ slug: identifier });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Don't return inactive products to public
    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not available'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product'
    });
  }
};

// @desc    Get all products for admin (including inactive)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products'
    });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting product'
    });
  }
};

// @desc    Add a review to a product
// @route   POST /api/products/:identifier/reviews
// @access  Private (any logged-in user)
const addReview = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { rating, comment } = req.body;

    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const product = isObjectId
      ? await Product.findById(identifier)
      : await Product.findOne({ slug: identifier });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // One review per user per product — update instead of duplicating
    const existingReview = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.createdAt = new Date();
    } else {
      product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating,
        comment
      });
    }

    // Recalculate aggregate rating
    product.rating.count = product.reviews.length;
    product.rating.average =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: existingReview ? 'Review updated successfully' : 'Review submitted successfully',
      data: product
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting review'
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview
};