import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/DashboardLayout';
import styled from 'styled-components';
import api from '../api';

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
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminCounts'],
    queryFn: async () => {
      const result = await api.get('/admin/counts')
      return result.data.data;
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
          <h3 className='text-lg font-semibold text-gray-700'>Active Users</h3>
          <p className='text-3xl font-bold text-blue-600'>
            {stats?.activeUsers || 0}
          </p>
        </StatCard>
        <StatCard>
          <h3 className='text-lg font-semibold text-gray-700'>Active Vendors</h3>
          <p className='text-3xl font-bold text-green-600'>
            {stats?.activeVendors || 0}
          </p>
        </StatCard>
        <StatCard>
          <h3 className='text-lg font-semibold text-gray-700'>Active Members</h3>
          <p className='text-3xl font-bold text-purple-600'>
            {stats?.activeMembers || 0}
          </p>
        </StatCard>
      </StatsContainer>
    </DashboardLayout>
  );
};

export default AdminDashboard;
