import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AddUserForm from '../components/AddUserForm';
import Button from '../components/Button';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import api from '../api';

const ContentContainer = styled.div`
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${theme.typography.h1.fontSize};
  font-weight: ${theme.typography.h1.fontWeight};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const ErrorMessage = styled.div`
  background-color: ${theme.colors.error.light};
  color: ${theme.colors.error.main};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
`;

const AdminDashboard = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminCounts'],
    queryFn: async () => {
      const result = await api.get('/admin/counts');
      return result.data.data;
    },
  });

  const handleUserCreated = () => {
    setShowAddUser(false);
    refetch();
  };

  if (isLoading) {
    return (
      <DashboardLayout title='Admin Dashboard'>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title='Admin Dashboard'>
        <ErrorMessage>
          Error loading dashboard data. Please try again later.
        </ErrorMessage>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='Admin Dashboard'>
      <ContentContainer>
        <HeaderContainer>
          <Title>Admin Dashboard</Title>
          <Button variant='primary' onClick={() => setShowAddUser(true)}>
            Add New User
          </Button>
        </HeaderContainer>

        <AddUserForm
          isOpen={showAddUser}
          onClose={() => setShowAddUser(false)}
          onSuccess={handleUserCreated}
        />

        <StatsContainer>
          <StatsCard
            title='Active Users'
            value={stats?.activeUsers || 0}
            color={theme.colors.primary.main}
          />
          <StatsCard
            title='Active Vendors'
            value={stats?.activeVendors || 0}
            color={theme.colors.secondary.dark}
          />
          <StatsCard
            title='Active Members'
            value={stats?.activeMembers || 0}
            color={theme.colors.primary.dark}
          />
        </StatsContainer>
      </ContentContainer>
    </DashboardLayout>
  );
};

export default AdminDashboard;
