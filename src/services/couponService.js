import api from './api';

const couponService = {
  validate: async (code, orderTotal) => {
    const response = await api.post('/coupons/validate', { code, orderTotal });
    return response.data;
  }
};

export default couponService;