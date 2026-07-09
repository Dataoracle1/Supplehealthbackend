import api from './api';

const cartService = {
  saveCart: async (items) => {
    // Best-effort background call — failures here should never surface to the user
    try {
      await api.post('/cart/save', { items });
    } catch (error) {
      console.warn('Cart snapshot save failed (non-critical):', error.message);
    }
  }
};

export default cartService;