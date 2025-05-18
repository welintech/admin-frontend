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

  /**
   * Fetches all payments
   * @returns {Promise<Array>} List of payments
   */
  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/payments');
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch payments');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches a specific payment by ID
   * @param {string} id - Payment ID
   * @returns {Promise<Object>} Payment details
   */
  const getPaymentById = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Failed to fetch payment details'
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates payment status
   * @param {string} id - Payment ID
   * @param {string} status - New payment status ('pending' | 'completed' | 'failed' | 'refunded')
   * @returns {Promise<Object>} Updated payment data
   */
  const updatePayment = async (id, status, memberId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put(`/payments/${id}`, { status, memberId });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update payment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a payment
   * @param {string} id - Payment ID
   * @returns {Promise<boolean>} Success status
   */
  const deletePayment = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/payments/${id}`);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete payment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifies a QR code payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Verification result
   */
  const verifyQRPayment = async (paymentId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/payments/verify-qr/${paymentId}`);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify QR payment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    /** @type {boolean} Loading state */
    isLoading,
    /** @type {string|null} Error message */
    error,
    /** @type {Function} Create payment function */
    createOrder,
    /** @type {Function} Fetch payments function */
    getOrderDetails,

    fetchPayments,
    /** @type {Function} Get payment by ID function */
    getPaymentById,
    /** @type {Function} Update payment function */
    updatePayment,
    /** @type {Function} Delete payment function */
    deletePayment,
    /** @type {Function} Verify QR payment function */
    verifyQRPayment,
  };
};

export default usePaymentApi;
