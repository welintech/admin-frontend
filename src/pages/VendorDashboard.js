import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/DashboardLayout';
import styled from 'styled-components';

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ItemCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const VendorDashboard = () => {
  // Mock data fetching with React Query
  const { data: items, isLoading } = useQuery({
    queryKey: ['vendorItems'],
    queryFn: async () => {
      // Replace with actual API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 1,
              name: 'Product A',
              price: 99.99,
              stock: 45,
              image: 'https://via.placeholder.com/150',
            },
            {
              id: 2,
              name: 'Product B',
              price: 149.99,
              stock: 12,
              image: 'https://via.placeholder.com/150',
            },
            {
              id: 3,
              name: 'Product C',
              price: 199.99,
              stock: 8,
              image: 'https://via.placeholder.com/150',
            },
          ]);
        }, 1000);
      });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title='Vendor Dashboard'>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='Vendor Dashboard'>
      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Quick Stats</h2>
        <div className='grid grid-cols-3 gap-4'>
          <div className='p-4 bg-blue-50 rounded-lg'>
            <p className='text-sm text-blue-600'>Total Products</p>
            <p className='text-2xl font-bold text-blue-700'>{items?.length}</p>
          </div>
          <div className='p-4 bg-green-50 rounded-lg'>
            <p className='text-sm text-green-600'>Total Stock</p>
            <p className='text-2xl font-bold text-green-700'>
              {items?.reduce((sum, item) => sum + item.stock, 0)}
            </p>
          </div>
          <div className='p-4 bg-purple-50 rounded-lg'>
            <p className='text-sm text-purple-600'>Low Stock Items</p>
            <p className='text-2xl font-bold text-purple-700'>
              {items?.filter((item) => item.stock < 10).length}
            </p>
          </div>
        </div>
      </div>

      <h2 className='text-xl font-semibold mb-4'>Your Products</h2>
      <ItemsGrid>
        {items?.map((item) => (
          <ItemCard key={item.id}>
            <img
              src={item.image}
              alt={item.name}
              className='w-full h-48 object-cover'
            />
            <div className='p-4'>
              <h3 className='font-semibold text-lg mb-2'>{item.name}</h3>
              <p className='text-gray-600 mb-2'>${item.price.toFixed(2)}</p>
              <div className='flex justify-between items-center'>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    item.stock < 10
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {item.stock} in stock
                </span>
                <button className='text-blue-600 hover:text-blue-800 font-medium'>
                  Edit
                </button>
              </div>
            </div>
          </ItemCard>
        ))}
      </ItemsGrid>
    </DashboardLayout>
  );
};

export default VendorDashboard;
