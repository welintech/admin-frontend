import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from './Layout';
import Button from './Button';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const role = user?.role.role;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout>
      <Layout.Sidebar>
        <div style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '1rem',
            }}
          >
            Welcome,{' '}
            <span style={{ color: '#3b82f6' }}>
              {user?.name || user.memberName}
            </span>
          </h2>
        </div>
        <nav>
          <Layout.NavItem as={NavLink} to={`/${role}`} end>
            Overview
          </Layout.NavItem>
          {role === 'admin' && (
            <>
              <Layout.NavItem as={NavLink} to='/admin/users'>
                Users
              </Layout.NavItem>
            </>
          )}
        </nav>
        <Button
          variant='danger'
          onClick={handleLogout}
          style={{ marginTop: '2rem', width: '100%' }}
        >
          Logout
        </Button>
      </Layout.Sidebar>
      <Layout.Main>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: '1.5rem',
          }}
        >
          {title}
        </h1>
        {children}
      </Layout.Main>
    </Layout>
  );
};

export default DashboardLayout;
