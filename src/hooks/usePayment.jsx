import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import initializeSDK from '../services/cashfreeService';
import usePaymentApi from './usePaymentApi';

export const usePayment = () => {
  const { createOrder } = usePaymentApi();

  const paymentMutation = useMutation({
    mutationFn: async ({ amount, type, returnUrl, additionalData }) => {
      // Initialize Cashfree SDK
      const cashfree = await initializeSDK();
      console.log('Cashfree SDK initialized:', cashfree);

      // Create order with required data
      const orderData = {
        amount: amount.toString(),
        paymentMethod: 'payment_link',
        status: 'pending',
        type,
        return_url: `${window.location.origin}${returnUrl}`,
        ...additionalData,
      };

      // Create order
      const orderResponse = await createOrder(orderData);

      if (!orderResponse) {
        throw new Error('Failed to create order');
      }

      // Get the payment session ID from the response
      const paymentSessionId = orderResponse.payment_session_id;

      if (!paymentSessionId) {
        throw new Error('Payment session ID not found in response');
      }

      return { cashfree, paymentSessionId, orderResponse };
    },
    onSuccess: (
      { cashfree, paymentSessionId, orderResponse },
      variables,
      context
    ) => {
      // Configure checkout options
      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: '_self', // Opens in the same tab
      };

      // Initialize the checkout
      cashfree.checkout(checkoutOptions);
      toast.success('Redirecting to payment page...');
    },
    onError: (error) => {
      console.error('Payment error:', error);
      toast.error('Failed to initialize payment');
    },
  });

  const initiatePayment = ({
    amount,
    type = 'payment',
    returnUrl = '/payment-status',
    additionalData = {},
  }) => {
    if (!amount) {
      toast.error('Amount is required');
      return;
    }

    paymentMutation.mutate(
      { amount, type, returnUrl, additionalData },
      {
        onSuccess: (data) => {
          console.log('Payment successful');
        },
        onError: (error) => {
          console.log('Payment failed,', error);
        },
      }
    );
  };

  return {
    initiatePayment,
    isProcessing: paymentMutation.isPending,
    error: paymentMutation.error,
  };
};
