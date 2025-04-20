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
import { useVendorsMembers } from '../hooks/useVendorMembers';

const VendorsPage = () => {
  const { data: vendors, isLoading: isVendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data.data.filter((user) => user.role === 'vendor');
    },
  });

  const vendorIds = React.useMemo(
    () => vendors?.map((vendor) => vendor._id) || [],
    [vendors]
  );

  const { data: membersData, isLoading: isMembersLoading } =
    useVendorsMembers(vendorIds);

  if (isVendorsLoading || isMembersLoading) {
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
        {vendors.map((vendor) => {
          const memberCount = membersData?.[vendor._id]?.length || 0;

          return (
            <UserCardComponent
              key={vendor._id}
              user={{
                ...vendor,
                memberCount,
              }}
            />
          );
        })}
      </UsersGrid>
    </DashboardLayout>
  );
};

export default VendorsPage;
