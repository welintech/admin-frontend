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

  static async checkPaymentStatus(paymentId) {
    try {
      const response = await api.get(`/payment/status/${paymentId}`);

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from server');
      }

      return response.data.data;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to check payment status'
      );
    }
  }

  static async paymentCallback(paymentId, status) {
    try {
      const response = await api.post('/payment/callback', {
        paymentId,
        status,
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from server');
      }

      return response.data.data;
    } catch (error) {
      console.error('Payment callback error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to process payment callback'
      );
    }
  }
}

export default PaymentService;
