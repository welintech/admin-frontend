import React, { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useMembers } from '../hooks/useMemberApi';
import PaymentButton from './PaymentButton';
import api from '../api';

const LoanProtectionCalculator = () => {
  const [selectedMember, setSelectedMember] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanStartDate, setLoanStartDate] = useState('');
  const [loanEndDate, setLoanEndDate] = useState('');
  const [premiumDetails, setPremiumDetails] = useState(null);

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

    const period = calculateLoanPeriod(loanStartDate, loanEndDate);
    if (period < 1) {
      toast.error('Loan period must be at least 1 year');
      return false;
    }

    return true;
  };

  const calculatePremiumMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMember || !loanAmount || !validateDates()) {
        throw new Error('Please fill all required fields');
      }

      const loanPeriod = calculateLoanPeriod(loanStartDate, loanEndDate);
      const loanAmountNum = parseFloat(loanAmount);

      const response = await api.get(`/premium/premium`, {
        params: {
          loanAmount: loanAmountNum,
          year: loanPeriod,
        },
      });

      return response.data;
    },
    onSuccess: (response) => {
      const { data } = response;
      const gst = data.premiumAmount * 0.05;
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
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to calculate premium'
      );
      console.error('Premium calculation error:', error);
    },
  });

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
              disabled={calculatePremiumMutation.isPending}
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
                disabled={calculatePremiumMutation.isPending}
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
                disabled={calculatePremiumMutation.isPending}
              />
            </div>
          </div>

          <button
            onClick={() => calculatePremiumMutation.mutate()}
            disabled={
              !selectedMember ||
              !loanAmount ||
              !loanStartDate ||
              !loanEndDate ||
              calculatePremiumMutation.isPending
            }
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {calculatePremiumMutation.isPending
              ? 'Calculating...'
              : 'Calculate Premium'}
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

            <div className='mt-6'>
              <PaymentButton
                amount={premiumDetails.totalPremium}
                type='loneCover'
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanProtectionCalculator;
