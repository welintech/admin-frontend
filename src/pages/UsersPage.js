import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api';
import {
  UsersGrid,
  UserCardComponent,
  LoadingSpinner,
  Spinner,
} from '../components/UserCard/UserCard';

const UsersPage = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data.data.filter((user) => user.role === 'user');
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title='Users'>
        <LoadingSpinner>
          <Spinner />
        </LoadingSpinner>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='Users'>
      <UsersGrid>
        {users.map((user) => (
          <UserCardComponent key={user._id} user={user} />
        ))}
      </UsersGrid>
    </DashboardLayout>
  );
};

export default UsersPage;
