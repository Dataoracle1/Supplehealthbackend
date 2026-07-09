const AbandonedCart = require('../models/AbandonedCart');

// @desc    Save/update the current user's cart snapshot (for abandoned-cart recovery)
// @route   POST /api/cart/save
// @access  Private
// Called by the frontend whenever the cart changes (debounced). If the cart
// is empty, the saved snapshot is removed instead of stored.
const saveCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      await AbandonedCart.findOneAndDelete({ user: req.user._id });
      return res.json({ success: true, message: 'Cart snapshot cleared' });
    }

    const normalizedItems = items.map((item) => ({
      product: item.product || item._id || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images?.[0]?.url || item.image || ''
    }));

    await AbandonedCart.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        email: req.user.email,
        items: normalizedItems,
        converted: false,
        reminderSentAt: null // reset — cart changed, give them a fresh window
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Cart snapshot saved' });
  } catch (error) {
    // Non-critical background feature — never let this break the shopping experience
    console.error('Save cart snapshot error:', error);
    res.status(200).json({ success: false, message: 'Cart snapshot not saved' });
  }
};

module.exports = { saveCart };