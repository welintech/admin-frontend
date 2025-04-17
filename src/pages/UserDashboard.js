import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/DashboardLayout';
import styled from 'styled-components';

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const UserDashboard = () => {
  // Mock data fetching with React Query
  const { data: userData, isLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      // Replace with actual API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            name: 'John Doe',
            email: 'john@example.com',
            recentActivity: [
              {
                id: 1,
                type: 'purchase',
                description: 'Purchased Product A',
                date: '2024-03-15T10:30:00Z',
              },
              {
                id: 2,
                type: 'view',
                description: 'Viewed Product B',
                date: '2024-03-14T15:45:00Z',
              },
              {
                id: 3,
                type: 'review',
                description: 'Left a review for Product C',
                date: '2024-03-13T09:20:00Z',
              },
            ],
          });
        }, 1000);
      });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title='User Dashboard'>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='User Dashboard'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>Profile Information</h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-600'>
                Name
              </label>
              <p className='mt-1 text-lg'>{userData?.name}</p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-600'>
                Email
              </label>
              <p className='mt-1 text-lg'>{userData?.email}</p>
            </div>
            <button className='mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
              Edit Profile
            </button>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>Recent Activity</h2>
          <ActivityList>
            {userData?.recentActivity.map((activity) => (
              <ActivityItem key={activity.id}>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='font-medium'>{activity.description}</p>
                    <p className='text-sm text-gray-500'>
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      activity.type === 'purchase'
                        ? 'bg-green-100 text-green-800'
                        : activity.type === 'view'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {activity.type}
                  </span>
                </div>
              </ActivityItem>
            ))}
          </ActivityList>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
