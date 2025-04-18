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

const VendorsPage = () => {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data.data.filter((user) => user.role === 'vendor');
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title='Vendors'>
        <LoadingSpinner>
          <Spinner />
        </LoadingSpinner>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='Vendors'>
      <UsersGrid>
        {vendors.map((vendor) => (
          <UserCardComponent key={vendor._id} user={vendor} />
        ))}
      </UsersGrid>
    </DashboardLayout>
  );
};

export default VendorsPage;
