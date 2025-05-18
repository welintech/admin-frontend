import React from 'react';
import { usePayment } from '../hooks/usePayment';

const PaymentButton = ({
  amount,
  type = 'payment',
  buttonText = 'Checkout',
  className = '',
  disabled = false,
  returnUrl = '/payment-status',
  additionalData = {},
}) => {
  const { initiatePayment, isProcessing } = usePayment();

  const handleCheckout = () => {
    initiatePayment({
      amount,
      type,
      returnUrl,
      additionalData,
    });
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isProcessing}
      className={`w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isProcessing ? 'Processing...' : buttonText}
    </button>
  );
};

export default PaymentButton;
