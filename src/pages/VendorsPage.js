import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api';

const VendorsPage = () => {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await api.get('/admin/vendors')
      const data = response.data.data
      return data.filter(vendor => vendor.role === 'vendor');
    },
  });
  if (isLoading) {
    return (
      <DashboardLayout title="Vendors">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Users">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Vendors List</h2>
        <ul>
          {vendors.map(vendor => (
            <li key={vendor._id} className="mb-2">
              {vendor.username} - {vendor.email}
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default VendorsPage;