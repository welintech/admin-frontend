import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api';

const UsersPage = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/admin/users')
      const data = response.data.data
      return data.filter(user => user.role === 'user');
    },
  });
  if (isLoading) {
    return (
      <DashboardLayout title="Users">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Users">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Users List</h2>
        <ul>
          {users.map(user => (
            <li key={user._id} className="mb-2">
              {user.username} - {user.email}
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;