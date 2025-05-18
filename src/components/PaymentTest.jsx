import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import usePaymentApi from '../hooks/usePaymentApi';

const PaymentTest = () => {
  // Get user data and token from localStorage
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [logs, setLogs] = useState([]);

  const {
    isLoading,
    error,
    createOrder: createPaymentApi,
    fetchPayments: fetchPaymentsApi,
    getPaymentById: getPaymentByIdApi,
    updatePayment: updatePaymentApi,
    deletePayment: deletePaymentApi,
    verifyQRPayment: verifyQRPaymentApi,
  } = usePaymentApi();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const authToken = localStorage.getItem('token');

    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (authToken) {
      setToken(authToken);
    } else {
      addLog('No authentication token found', 'error');
      toast.error('Please login to access payment features');
    }
  }, []);

  // Function to add logs with timestamp and type
  const addLog = (message, type = 'info', data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type, data };
    setLogs((prev) => [...prev, logEntry]);
    console.log(`[${timestamp}] [${type}] ${message}`, data || '');
  };

  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'INR',
    paymentMethod: 'qr_code',
    description: '',
    status: 'pending',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createOrder = async () => {
    if (!userData || !token) {
      addLog('Authentication required', 'error', {
        hasUserData: !!userData,
        hasToken: !!token,
      });
      toast.error('Please login first');
      return;
    }

    addLog('Starting payment creation...', 'info', {
      ...paymentData,
      user: userData._id,
      tokenStatus: 'Token exists',
    });

    try {
      const response = await createPaymentApi({
        ...paymentData,
        user: userData._id,
      });

      addLog('Payment created successfully', 'success', response);
      toast.success('Payment created successfully');
      fetchPayments();
    } catch (error) {
      addLog('Payment creation failed', 'error', {
        message: error.message,
        fullError: error.response?.data || error,
        authStatus: {
          hasUserData: !!userData,
          hasToken: !!token,
          token: token ? 'Token exists' : 'No token found',
        },
      });
      toast.error(error.message);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetchPaymentsApi();
      setPayments(response);
    } catch (error) {
      addLog(
        'Failed to fetch payments',
        'error',
        error.response?.data || error
      );
      toast.error('Failed to fetch payments');
    }
  };

  const getPaymentById = async (id) => {
    try {
      const response = await getPaymentByIdApi(id);
      setSelectedPayment(response);
      toast.success('Payment details fetched successfully');
    } catch (error) {
      addLog(
        'Failed to fetch payment details',
        'error',
        error.response?.data || error
      );
      toast.error('Failed to fetch payment details');
    }
  };

  const updatePayment = async (id, status) => {
    addLog(`Updating payment status for ID: ${id} to ${status}`, 'info');
    try {
      const response = await updatePaymentApi(id, status);
      addLog('Payment updated successfully', 'success', response);
      toast.success('Payment updated successfully');
      fetchPayments();
    } catch (error) {
      addLog(
        'Failed to update payment',
        'error',
        error.response?.data || error
      );
      toast.error('Failed to update payment');
    }
  };

  const deletePayment = async (id) => {
    addLog(`Deleting payment with ID: ${id}`, 'info');
    try {
      await deletePaymentApi(id);
      addLog('Payment deleted successfully', 'success');
      toast.success('Payment deleted successfully');
      fetchPayments();
    } catch (error) {
      addLog(
        'Failed to delete payment',
        'error',
        error.response?.data || error
      );
      toast.error('Failed to delete payment');
    }
  };

  const verifyQRPayment = async (paymentId) => {
    addLog(`Verifying QR payment for ID: ${paymentId}`, 'info');
    try {
      const response = await verifyQRPaymentApi(paymentId);
      addLog('QR payment verified successfully', 'success', response);
      toast.success('QR payment verified successfully');
      fetchPayments();
    } catch (error) {
      addLog(
        'Failed to verify QR payment',
        'error',
        error.response?.data || error
      );
      toast.error('Failed to verify QR payment');
    }
  };

  // Auto-scroll logs to bottom
  useEffect(() => {
    const logsContainer = document.getElementById('logs-container');
    if (logsContainer) {
      logsContainer.scrollTop = logsContainer.scrollHeight;
    }
  }, [logs]);

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Payment Routes Test</h1>

      {/* User Info */}
      {userData ? (
        <div className='bg-white p-4 rounded-lg shadow-md mb-6'>
          <h2 className='text-lg font-semibold mb-2'>User Information</h2>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-600'>User ID</p>
              <p className='font-medium'>{userData._id}</p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Role</p>
              <p className='font-medium'>{userData.role}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className='bg-red-100 p-4 rounded-lg mb-6'>
          <p className='text-red-600'>Please login to test payments</p>
        </div>
      )}

      {/* Create Payment Form */}
      <div className='bg-white p-6 rounded-lg shadow-md mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Create Payment</h2>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Amount
            </label>
            <input
              type='number'
              name='amount'
              value={paymentData.amount}
              onChange={handleInputChange}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Description
            </label>
            <input
              type='text'
              name='description'
              value={paymentData.description}
              onChange={handleInputChange}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Payment Method
            </label>
            <select
              name='paymentMethod'
              value={paymentData.paymentMethod}
              onChange={handleInputChange}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            >
              <option value='qr_code'>QR Code</option>
              <option value='credit_card'>Credit Card</option>
              <option value='debit_card'>Debit Card</option>
              <option value='net_banking'>Net Banking</option>
              <option value='upi'>UPI</option>
              <option value='wallet'>Wallet</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Status
            </label>
            <select
              name='status'
              value={paymentData.status}
              onChange={handleInputChange}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            >
              <option value='pending'>Pending</option>
              <option value='completed'>Completed</option>
              <option value='failed'>Failed</option>
              <option value='refunded'>Refunded</option>
            </select>
          </div>
          <button
            onClick={createOrder}
            disabled={isLoading || !userData}
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Creating...' : 'Create Payment'}
          </button>
        </div>
      </div>

      {/* Payments List */}
      <div className='bg-white p-6 rounded-lg shadow-md mb-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Payments List</h2>
          <button
            onClick={fetchPayments}
            className='bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700'
          >
            Refresh List
          </button>
        </div>
        <div className='space-y-4'>
          {payments.map((payment) => (
            <div key={payment._id} className='border p-4 rounded-lg'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-medium'>ID: {payment.transactionId}</p>
                  <p>Amount: ₹{payment.amount}</p>
                  <p>Status: {payment.status}</p>
                  <p>Method: {payment.paymentMethod}</p>
                </div>
                <div className='space-x-2'>
                  <button
                    onClick={() => getPaymentById(payment._id)}
                    className='bg-blue-600 text-white px-3 py-1 rounded-md text-sm'
                  >
                    Details
                  </button>
                  <button
                    onClick={() => updatePayment(payment._id, 'completed')}
                    className='bg-green-600 text-white px-3 py-1 rounded-md text-sm'
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => deletePayment(payment._id)}
                    className='bg-red-600 text-white px-3 py-1 rounded-md text-sm'
                  >
                    Delete
                  </button>
                  {payment.paymentMethod === 'qr_code' && (
                    <button
                      onClick={() => verifyQRPayment(payment.transactionId)}
                      className='bg-purple-600 text-white px-3 py-1 rounded-md text-sm'
                    >
                      Verify QR
                    </button>
                  )}
                </div>
              </div>
              {selectedPayment?._id === payment._id && (
                <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                  <h3 className='font-medium mb-2'>Payment Details</h3>
                  <pre className='text-sm overflow-auto'>
                    {JSON.stringify(selectedPayment, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logs Section */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Test Logs</h2>
          <button
            onClick={() => setLogs([])}
            className='bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700'
          >
            Clear Logs
          </button>
        </div>
        <div
          id='logs-container'
          className='h-[400px] overflow-y-auto bg-gray-50 p-4 rounded font-mono text-sm'
        >
          {logs.map((log, index) => (
            <div
              key={index}
              className={`mb-1 ${
                log.type === 'error'
                  ? 'text-red-600'
                  : log.type === 'success'
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}
            >
              <span className='text-gray-400'>[{log.timestamp}]</span>{' '}
              {log.message}
              {log.data && (
                <pre className='mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto'>
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;
