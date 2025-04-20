import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../styles/theme';

const ProfileContainer = styled.div`
  background: ${theme.colors.secondary.light};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
  margin-top: ${theme.spacing.md};
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};
`;

const ProfileItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

const Value = styled.p`
  font-size: 1rem;
  color: ${theme.colors.text.primary};
  margin: 0;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: ${theme.colors.text.secondary};
`;

const UserDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardLayout title='User Dashboard'>
        <LoadingContainer>
          <p>Loading user data...</p>
        </LoadingContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='User Dashboard'>
      <ProfileContainer>
        <ProfileGrid>
          <ProfileItem>
            <Label>Welin ID</Label>
            <Value>{user.welinId}</Value>
          </ProfileItem>

          <ProfileItem>
            <Label>Name</Label>
            <Value>{user.memberName}</Value>
          </ProfileItem>

          <ProfileItem>
            <Label>Email</Label>
            <Value>{user.email}</Value>
          </ProfileItem>

          <ProfileItem>
            <Label>Contact Number</Label>
            <Value>{user.contactNo}</Value>
          </ProfileItem>
        </ProfileGrid>
      </ProfileContainer>
    </DashboardLayout>
  );
};

export default UserDashboard;
