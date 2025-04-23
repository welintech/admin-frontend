import api from '../api';

class PaymentService {
  static async generateQR(amount, description) {
    try {
      const response = await api.post('/payment/qr', {
        amount,
        description,
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from server');
      }

      return response.data.data;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to generate QR code'
      );
    }
  }

  static async generatePaymentLink(amount, description, callbackUrl) {
    try {
      const response = await api.post('/payment/link', {
        amount,
        description,
        callbackUrl,
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from server');
      }

      return response.data.data;
    } catch (error) {
      console.error('Payment link generation error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to generate payment link'
      );
    }
  }
}

export default PaymentService;
