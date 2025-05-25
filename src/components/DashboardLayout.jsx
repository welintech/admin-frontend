import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from './Layout';
import Button from './Button';
import { Modal, Form, Alert } from 'react-bootstrap';
import { useMutation } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'react-toastify';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const role = user?.role.role;
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (password.length > 20) {
      errors.push('Password must be less than 20 characters');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await api.post('/auth/change-password', {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || 'Failed to change password';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setValidationErrors({});
      setTimeout(() => {
        setShowChangePassword(false);
      }, 2000);
    },
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate current password
    if (!passwordData.currentPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        currentPassword: 'Current password is required',
      }));
      return;
    }

    // Check if new password is same as current password
    if (passwordData.currentPassword === passwordData.newPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        newPassword: 'New password must be different from current password',
      }));
      return;
    }

    // Validate new password
    const newPasswordErrors = validatePassword(passwordData.newPassword);
    if (newPasswordErrors.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        newPassword: newPasswordErrors[0],
      }));
      return;
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }));
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <Button
            variant='outline-primary'
            onClick={() => setShowChangePassword(true)}
            style={{ width: '100%' }}
          >
            Change Password
          </Button>
          <Button
            variant='danger'
            onClick={handleLogout}
            style={{ width: '100%' }}
          >
            Logout
          </Button>
        </div>
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

      <Modal
        show={showChangePassword}
        onHide={() => {
          setShowChangePassword(false);
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          setValidationErrors({});
          changePasswordMutation.reset();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {changePasswordMutation.isError && (
            <Alert variant='danger'>
              {changePasswordMutation.error?.message}
            </Alert>
          )}
          {changePasswordMutation.isSuccess && (
            <Alert variant='success'>Password changed successfully</Alert>
          )}
          <Form onSubmit={handleChangePassword}>
            <Form.Group className='mb-3'>
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type='password'
                name='currentPassword'
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.currentPassword}
                required
                disabled={changePasswordMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleChangePassword(e);
                  }
                }}
              />
              <Form.Control.Feedback type='invalid'>
                {validationErrors.currentPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type='password'
                name='newPassword'
                value={passwordData.newPassword}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.newPassword}
                required
                disabled={changePasswordMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleChangePassword(e);
                  }
                }}
              />
              <Form.Control.Feedback type='invalid'>
                {validationErrors.newPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type='password'
                name='confirmPassword'
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.confirmPassword}
                required
                disabled={changePasswordMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleChangePassword(e);
                  }
                }}
              />
              <Form.Control.Feedback type='invalid'>
                {validationErrors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <div className='d-flex justify-content-end gap-2'>
              <Button
                variant='secondary'
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  setValidationErrors({});
                  changePasswordMutation.reset();
                }}
                disabled={changePasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                variant='primary'
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending
                  ? 'Changing...'
                  : 'Change Password'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default DashboardLayout;
