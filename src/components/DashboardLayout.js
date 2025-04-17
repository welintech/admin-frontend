import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f3f4f6;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: white;
  position: fixed;
  height: 100vh;
  padding: 1rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
`;

const MainContent = styled.div`
  margin-left: 250px;
  padding: 2rem;
`;

const NavItem = styled(Link)`
  display: block;
  padding: 0.75rem 1rem;
  color: #4b5563;
  text-decoration: none;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  &:hover {
    background-color: #f3f4f6;
    color: #1f2937;
  }
`;

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <h2 className='text-xl font-bold mb-6 text-gray-800'>Dashboard</h2>
        <div className='mb-8'>
          <p className='text-sm text-gray-600'>Welcome,</p>
          <p className='font-semibold text-gray-800'>{user?.name}</p>
        </div>
        <nav>
          <NavItem to={`/${user?.role}`}>Overview</NavItem>
          {user?.role === 'admin' && (
            <>
              <NavItem to='/admin/users'>Users</NavItem>
              <NavItem to='/admin/vendors'>Vendors</NavItem>
            </>
          )}
          {user?.role === 'vendor' && (
            <>
              <NavItem to='/vendor/items'>Items</NavItem>
              <NavItem to='/vendor/services'>Services</NavItem>
            </>
          )}
          {user?.role === 'user' && (
            <>
              <NavItem to='/user/profile'>Profile</NavItem>
              <NavItem to='/user/activity'>Activity</NavItem>
            </>
          )}
        </nav>
        <button
          onClick={handleLogout}
          className='mt-8 w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
        >
          Logout
        </button>
      </Sidebar>
      <MainContent>
        <h1 className='text-2xl font-bold mb-6 text-gray-800'>{title}</h1>
        {children}
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardLayout;
