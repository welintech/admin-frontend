import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/DashboardLayout';
import styled from 'styled-components';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const AdminDashboard = () => {
  // Mock data fetching with React Query
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      // Replace with actual API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalUsers: 150,
            totalVendors: 45,
            activeUsers: 120,
            activeVendors: 35,
          });
        }, 1000);
      });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title='Admin Dashboard'>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='Admin Dashboard'>
      <StatsContainer>
        <StatCard>
          <h3 className='text-lg font-semibold text-gray-700'>Total Users</h3>
          <p className='text-3xl font-bold text-blue-600'>
            {stats?.totalUsers}
          </p>
        </StatCard>
        <StatCard>
          <h3 className='text-lg font-semibold text-gray-700'>Total Vendors</h3>
          <p className='text-3xl font-bold text-green-600'>
            {stats?.totalVendors}
          </p>
        </StatCard>
        <StatCard>
          <h3 className='text-lg font-semibold text-gray-700'>Active Users</h3>
          <p className='text-3xl font-bold text-purple-600'>
            {stats?.activeUsers}
          </p>
        </StatCard>
        <StatCard>
          <h3 className='text-lg font-semibold text-gray-700'>
            Active Vendors
          </h3>
          <p className='text-3xl font-bold text-yellow-600'>
            {stats?.activeVendors}
          </p>
        </StatCard>
      </StatsContainer>

      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold mb-4'>Recent Activity</h2>
        <div className='space-y-4'>
          <div className='flex items-center justify-between p-4 bg-gray-50 rounded'>
            <div>
              <p className='font-medium'>New user registration</p>
              <p className='text-sm text-gray-500'>2 hours ago</p>
            </div>
            <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm'>
              Completed
            </span>
          </div>
          <div className='flex items-center justify-between p-4 bg-gray-50 rounded'>
            <div>
              <p className='font-medium'>Vendor account verification</p>
              <p className='text-sm text-gray-500'>4 hours ago</p>
            </div>
            <span className='px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm'>
              Pending
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
