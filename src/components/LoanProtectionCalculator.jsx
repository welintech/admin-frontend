import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'react-toastify';
import { useMembers } from '../hooks/useMemberApi';
import { FaQrcode, FaLink } from 'react-icons/fa';
import PaymentService from '../services/paymentService';
import usePaymentApi from '../hooks/usePaymentApi';
import { useNavigate } from 'react-router-dom';

const LoanProtectionCalculator = () => {
  const [selectedMember, setSelectedMember] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanStartDate, setLoanStartDate] = useState('');
  const [loanEndDate, setLoanEndDate] = useState('');
  const [premiumDetails, setPremiumDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showLink, setShowLink] = useState(false);
  const { createPayment, updatePayment } = usePaymentApi();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'processing', 'completed'
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  // Get vendor data from localStorage
  const vendorData = useMemo(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Fetch members data using the custom hook
  const { data: members = [], isLoading: isLoadingMembers } = useMembers(
    vendorData?._id
  );

  const calculateLoanPeriod = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
    // Round up to nearest whole year
    return Math.max(1, Math.ceil(diffYears));
  };

  const validateDates = () => {
    if (!loanStartDate || !loanEndDate) {
      toast.error('Please select both start and end dates');
      return false;
    }

    const start = new Date(loanStartDate);
    const end = new Date(loanEndDate);
    const today = new Date();

    // Reset time components to compare only dates
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      toast.error('Loan start date cannot be in the past');
      return false;
    }

    if (end <= start) {
      toast.error('Loan end date must be after start date');
      return false;
    }

    // Calculate and validate loan period
    const period = calculateLoanPeriod(loanStartDate, loanEndDate);
    if (period < 1) {
      toast.error('Loan period must be at least 1 year');
      return false;
    }

    return true;
  };

  const calculatePremium = async () => {
    if (!selectedMember || !loanAmount || !validateDates()) {
      return;
    }

    setIsLoading(true);
    try {
      const loanPeriod = calculateLoanPeriod(loanStartDate, loanEndDate);
      const loanAmountNum = parseFloat(loanAmount);

      // Call the premium calculation API
      const response = await api.get(`/premium/premium`, {
        params: {
          loanAmount: loanAmountNum,
          year: loanPeriod,
        },
      });

      const { data } = response.data;
      const gst = data.premiumAmount * 0.05; // 5% GST
      const totalPremium = data.premiumAmount + gst;

      setPremiumDetails({
        requestedLoanAmount: data.requestedLoanAmount,
        actualLoanAmount: data.actualLoanAmount,
        loanPeriod: data.year,
        basePremium: data.premiumAmount,
        gst,
        totalPremium,
        isExactMatch: data.isExactMatch,
      });
      setShowQR(false); // Reset QR visibility when new calculation is done
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to calculate premium'
      );
      console.error('Premium calculation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createLoanCover = async () => {
    try {
      const response = await api.post('/loan-cover', {
        memberId: selectedMember,
        vendorId: vendorData._id,
        loanAmount: premiumDetails.actualLoanAmount,
        coverageStartDate: loanStartDate,
        coverageEndDate: loanEndDate,
        basePremium: premiumDetails.basePremium,
        gst: premiumDetails.gst,
        totalPremium: premiumDetails.totalPremium,
      });
      return response.data.data;
    } catch (error) {
      console.error('Loan cover creation failed:', error);
      toast.error('Failed to create loan cover');
      return null;
    }
  };

  const createPaymentWithLoanCover = async (paymentMethod) => {
    const loanCover = await createLoanCover();
    if (!loanCover) {
      toast.error('Failed to create loan cover');
      return null;
    }

    const paymentResponse = await createPayment({
      amount: premiumDetails.totalPremium.toString(),
      currency: 'INR',
      paymentMethod,
      description: `Loan Protection Premium - ${selectedMember}`,
      status: 'pending',
      user: selectedMember,
      loanCoverId: loanCover._id,
    });

    return paymentResponse;
  };

  const handlePayment = async (type) => {
    setIsProcessing(true);
    setModalType(type);
    try {
      const paymentResponse = await createPaymentWithLoanCover(
        type === 'qr' ? 'qr_code' : 'payment_link'
      );

      if (!paymentResponse) return;

      setPaymentDetails({
        ...paymentResponse,
        ...(type === 'qr'
          ? {
              qrCode: paymentResponse.qrCode.data,
              expiresAt: paymentResponse.qrCode.expiresAt,
            }
          : {
              paymentLink: paymentResponse.paymentLink.url,
              shortUrl: paymentResponse.paymentLink.shortUrl,
              expiresAt: paymentResponse.paymentLink.expiresAt,
            }),
        paymentId: paymentResponse.transactionId,
        amount: paymentResponse.amount,
        description: paymentResponse.description,
      });

      setShowModal(true);
      toast.success(
        `${type === 'qr' ? 'QR code' : 'Payment link'} generated successfully`
      );
    } catch (error) {
      console.error(`Error in ${type} payment:`, error);
      toast.error(
        `Failed to generate ${type === 'qr' ? 'QR code' : 'payment link'}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQRPayment = () => handlePayment('qr');
  const handlePaymentLink = () => handlePayment('link');

  const simulatePayment = async (paymentId) => {
    setPaymentStatus('processing');
    try {
      // Simulate 2 second payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update payment status to completed
      await updatePayment(paymentId, 'completed');
      setPaymentStatus('completed');
      toast.success('Payment completed successfully!');

      // Show redirecting message and navigate after delay
      setIsRedirecting(true);
      setTimeout(() => {
        navigate('/vendor');
      }, 3000);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
      setPaymentStatus('pending');
    }
  };

  const PaymentModal = () => {
    if (!showModal || !paymentDetails) return null;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-6 max-w-md w-full'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-semibold'>
              {modalType === 'qr' ? 'QR Code Payment' : 'Payment Link'}
            </h3>
            <button
              onClick={() => {
                setShowModal(false);
                setPaymentStatus('pending');
              }}
              className='text-gray-500 hover:text-gray-700'
            >
              <svg
                className='w-6 h-6'
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
            </button>
          </div>

          <div className='space-y-4'>
            <PaymentDetails paymentDetails={paymentDetails} />

            {paymentStatus === 'pending' && (
              <>
                {modalType === 'qr' ? (
                  <QRDisplay qrCode={paymentDetails.qrCode} />
                ) : (
                  <PaymentLinkDisplay
                    paymentLink={paymentDetails.paymentLink}
                    shortUrl={paymentDetails.shortUrl}
                  />
                )}
                <button
                  onClick={() => simulatePayment(paymentDetails._id)}
                  className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                >
                  Simulate Payment
                </button>
              </>
            )}

            {paymentStatus === 'processing' && (
              <div className='flex flex-col items-center space-y-4'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                <p className='text-blue-600 font-medium'>
                  Processing Payment...
                </p>
              </div>
            )}

            {paymentStatus === 'completed' && (
              <div className='flex flex-col items-center space-y-4'>
                <div className='rounded-full h-12 w-12 bg-green-100 flex items-center justify-center'>
                  <svg
                    className='h-8 w-8 text-green-600'
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
                </div>
                <p className='text-green-600 font-medium'>
                  Payment Completed Successfully!
                </p>
                <div className='text-sm text-gray-500'>
                  Transaction ID: {paymentDetails.paymentId}
                </div>
                {isRedirecting && (
                  <div className='flex items-center space-x-2 text-blue-600'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                    <span>Redirecting to vendor dashboard...</span>
                  </div>
                )}
              </div>
            )}

            {paymentDetails.expiresAt && paymentStatus === 'pending' && (
              <ExpirationTime expiresAt={paymentDetails.expiresAt} />
            )}
          </div>
        </div>
      </div>
    );
  };

  const PaymentDetails = ({ paymentDetails }) => (
    <>
      <div className='flex justify-between'>
        <span className='text-gray-600'>Amount:</span>
        <span className='font-medium'>₹{paymentDetails.amount}</span>
      </div>
      <div className='flex justify-between'>
        <span className='text-gray-600'>Payment ID:</span>
        <span className='font-medium'>{paymentDetails.paymentId}</span>
      </div>
      <div className='flex justify-between'>
        <span className='text-gray-600'>Description:</span>
        <span className='font-medium'>{paymentDetails.description}</span>
      </div>
    </>
  );

  const QRDisplay = ({ qrCode }) => (
    <div className='flex flex-col items-center'>
      <img src={qrCode} alt='QR Code' className='w-48 h-48 mb-4' />
      <p className='text-sm text-gray-500'>Scan this QR code to make payment</p>
    </div>
  );

  const PaymentLinkDisplay = ({ paymentLink, shortUrl }) => (
    <div className='space-y-2'>
      <p className='text-sm text-gray-600'>Payment Link:</p>
      <a
        href={paymentLink}
        target='_blank'
        rel='noopener noreferrer'
        className='block p-2 bg-gray-100 rounded break-all text-blue-600 hover:underline'
      >
        {shortUrl || paymentLink}
      </a>
    </div>
  );

  const ExpirationTime = ({ expiresAt }) => (
    <p className='text-sm text-gray-500 text-center'>
      Expires at: {new Date(expiresAt).toLocaleString()}
    </p>
  );

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-6'>
          Loan Protection Premium Calculator
        </h2>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Select Member
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={isLoadingMembers}
            >
              <option value=''>Select a member</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.memberName} - {member.welinId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Loan Amount (₹)
            </label>
            <input
              type='number'
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter loan amount'
              disabled={isLoading}
              min='10000'
              max='1000000'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Loan Start Date
              </label>
              <input
                type='date'
                value={loanStartDate}
                onChange={(e) => setLoanStartDate(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                min={new Date().toISOString().split('T')[0]}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Loan End Date
              </label>
              <input
                type='date'
                value={loanEndDate}
                onChange={(e) => setLoanEndDate(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                min={loanStartDate || new Date().toISOString().split('T')[0]}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            onClick={calculatePremium}
            disabled={
              !selectedMember ||
              !loanAmount ||
              !loanStartDate ||
              !loanEndDate ||
              isLoading
            }
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Calculating...' : 'Calculate Premium'}
          </button>
        </div>

        {premiumDetails && (
          <div className='mt-6 bg-gray-50 p-4 rounded-md'>
            <h3 className='text-lg font-medium text-gray-800 mb-4'>
              Premium Details
            </h3>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Loan Period:</span>
                <span className='font-medium'>
                  {premiumDetails.loanPeriod} years
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Requested Loan Amount:</span>
                <span className='font-medium'>
                  ₹{premiumDetails.requestedLoanAmount.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Actual Loan Amount:</span>
                <span className='font-medium'>
                  ₹{premiumDetails.actualLoanAmount.toFixed(2)}
                </span>
                {!premiumDetails.isExactMatch && (
                  <span className='text-yellow-600 text-sm ml-2'>
                    (Next available amount)
                  </span>
                )}
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Base Premium:</span>
                <span className='font-medium'>
                  ₹{premiumDetails.basePremium.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>GST (5%):</span>
                <span className='font-medium'>
                  ₹{premiumDetails.gst.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between border-t pt-2'>
                <span className='text-gray-800 font-medium'>
                  Total Premium:
                </span>
                <span className='text-blue-600 font-bold'>
                  ₹{premiumDetails.totalPremium.toFixed(2)}
                </span>
              </div>
            </div>

            <div className='mt-6 space-y-3'>
              <button
                onClick={handleQRPayment}
                disabled={isProcessing}
                className='w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <FaQrcode className='text-xl' />
                {isProcessing && modalType === 'qr'
                  ? 'Generating QR...'
                  : 'Get Payment QR'}
              </button>

              <button
                onClick={handlePaymentLink}
                disabled={isProcessing}
                className='w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <FaLink className='text-xl' />
                {isProcessing && modalType === 'link'
                  ? 'Generating Link...'
                  : 'Generate Payment Link'}
              </button>
            </div>
          </div>
        )}

        <PaymentModal />
      </div>
    </div>
  );
};

export default LoanProtectionCalculator;
