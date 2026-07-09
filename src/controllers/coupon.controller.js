const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || orderTotal === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order total are required'
      });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    const usability = coupon.isUsable(orderTotal);
    if (!usability.valid) {
      return res.status(400).json({
        success: false,
        message: usability.reason
      });
    }

    const userUsageCount = await Order.countDocuments({
      user: req.user._id,
      couponCode: coupon.code,
      status: { $ne: 'cancelled' }
    });

    if (userUsageCount >= coupon.maxUsesPerUser) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon the maximum number of times'
      });
    }

    const discountAmount = coupon.calculateDiscount(orderTotal);

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        newTotal: Math.max(0, orderTotal - discountAmount)
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error validating coupon'
    });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });
  } catch (error) {
    console.error('Create coupon error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A coupon with this code already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create coupon' });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, message: 'Coupon updated successfully', data: coupon });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update coupon' });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};