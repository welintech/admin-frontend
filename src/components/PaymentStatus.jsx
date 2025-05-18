import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const PaymentStatus = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/payments/order/${orderId}`);
      setOrderDetails(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payment status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='bg-red-50 p-4 rounded-lg'>
          <p className='text-red-600'>{error}</p>
        </div>
      </div>
    );
  }

  const isSuccess = orderDetails?.payment_status === 'SUCCESS';

  return (
    <div className='min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='text-center mb-8'>
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                isSuccess ? 'bg-green-100' : 'bg-red-100'
              } mb-4`}
            >
              {isSuccess ? (
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              ) : (
                <svg
                  className='w-8 h-8 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              )}
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Payment {isSuccess ? 'Successful' : 'Failed'}
            </h2>
            <p className='text-gray-600'>
              {orderDetails?.payment_message || 'Payment processed'}
            </p>
          </div>

          <div className='border-t border-gray-200 pt-6'>
            <dl className='space-y-4'>
              <div className='flex justify-between'>
                <dt className='text-sm font-medium text-gray-500'>Order ID</dt>
                <dd className='text-sm text-gray-900'>
                  {orderDetails?.order_id}
                </dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-sm font-medium text-gray-500'>Amount</dt>
                <dd className='text-sm text-gray-900'>
                  ₹{orderDetails?.order_amount}
                </dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-sm font-medium text-gray-500'>Currency</dt>
                <dd className='text-sm text-gray-900'>
                  {orderDetails?.order_currency}
                </dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-sm font-medium text-gray-500'>
                  Payment Method
                </dt>
                <dd className='text-sm text-gray-900 capitalize'>
                  {orderDetails?.payment_method?.upi?.channel || 'UPI'}
                </dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-sm font-medium text-gray-500'>
                  Payment Time
                </dt>
                <dd className='text-sm text-gray-900'>
                  {new Date(orderDetails?.payment_time).toLocaleString()}
                </dd>
              </div>
              {orderDetails?.payment_gateway_details && (
                <>
                  <div className='flex justify-between'>
                    <dt className='text-sm font-medium text-gray-500'>
                      Gateway
                    </dt>
                    <dd className='text-sm text-gray-900'>
                      {orderDetails.payment_gateway_details.gateway_name}
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-sm font-medium text-gray-500'>
                      Gateway Order ID
                    </dt>
                    <dd className='text-sm text-gray-900'>
                      {orderDetails.payment_gateway_details.gateway_order_id}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          <div className='mt-8 text-center'>
            <a
              href='/user'
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
