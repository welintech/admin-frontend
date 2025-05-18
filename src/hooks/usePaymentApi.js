import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

/**
 * Custom hook for handling payment-related API calls
 * @returns {Object} Payment API functions and states
 */
const usePaymentApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Creates a new payment
   * @param {Object} paymentData - Payment creation data
   * @param {string} paymentData.amount - Payment amount
   * @param {string} paymentData.currency - Currency code (e.g., 'INR')
   * @param {string} paymentData.paymentMethod - Payment method (e.g., 'qr_code', 'credit_card')
   * @param {string} paymentData.description - Payment description
   * @param {string} paymentData.status - Payment status (e.g., 'pending', 'completed')
   * @param {string} paymentData.user - User ID who is making the payment
   * @returns {Promise<Object>} Created payment data
   */
  const createOrder = async (paymentData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/payments', paymentData);

      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create payment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderDetails = async (orderId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/payments/${orderId}`);
      return response.data.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Failed to fetch order details'
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createOrder,
    getOrderDetails,
  };
};

export default usePaymentApi;
