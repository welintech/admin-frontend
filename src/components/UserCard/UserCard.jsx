import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEdit, FaEllipsisV, FaCircle, FaPowerOff } from 'react-icons/fa';
import UserForm from '../UserForm';
import { useUserForm } from '../../hooks/useUserForm';
import { toast } from 'react-toastify';
import Modal from '../Modal';

export const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const UserCard = styled.div`
  background: ${(props) => (props['data-active'] ? '#fff' : '#f5f5f5')};
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  transition: transform 0.2s ease-in-out;
  border: 1px solid
    ${(props) => (props['data-active'] ? 'transparent' : '#ddd')};
  opacity: ${(props) => (props['data-active'] ? 1 : 0.8)};
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    .menu-container {
      opacity: 1;
      visibility: visible;
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

const UserName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const UserRole = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DetailLabel = styled.span`
  color: #666;
  font-weight: 500;
  min-width: 100px;
  font-size: 14px;
`;

const DetailValue = styled.span`
  color: #333;
  font-size: 14px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${(props) => (props['data-active'] ? '#e8f5e9' : '#ffebee')};
  color: ${(props) => (props['data-active'] ? '#2e7d32' : '#c62828')};
  margin-top: 12px;
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: ${(props) => (props['data-active'] ? '#2e7d32' : '#c62828')};
`;

const MenuContainer = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease-in-out;

  &:hover {
    .menu-dropdown {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #1976d2;
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease-in-out;
  margin-top: 4px;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: #1976d2;
  }

  svg {
    font-size: 14px;
  }
`;

export const UserCardComponent = ({ user }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const { activateUser, deactivateUser, isActivating, isDeactivating } =
    useUserForm();

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
  };

  const handleStatusClick = () => {
    setIsStatusModalOpen(true);
  };

  const handleStatusToggle = () => {
    if (user.isActive) {
      deactivateUser.mutate(user._id, {
        onSuccess: () => {
          toast.success('User deactivated successfully');
          setIsStatusModalOpen(false);
        },
      });
    } else {
      activateUser.mutate(user._id, {
        onSuccess: () => {
          toast.success('User activated successfully');
          setIsStatusModalOpen(false);
        },
      });
    }
  };

  return (
    <>
      <UserCard data-active={user.isActive}>
        <MenuContainer className='menu-container'>
          <MenuButton>
            <FaEllipsisV />
          </MenuButton>
          <MenuDropdown className='menu-dropdown'>
            {user.isActive && (
              <MenuItem onClick={handleEditClick}>
                <FaEdit /> Edit
              </MenuItem>
            )}
            <MenuItem onClick={handleStatusClick}>
              <FaPowerOff /> {user.isActive ? 'Deactivate' : 'Activate'}
            </MenuItem>
          </MenuDropdown>
        </MenuContainer>
        <CardHeader>
          <UserName>{user.name}</UserName>
          <UserRole>{user.role.role}</UserRole>
        </CardHeader>
        <UserDetails>
          <DetailRow>
            <DetailLabel>Email:</DetailLabel>
            <DetailValue>{user.email}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Mobile:</DetailLabel>
            <DetailValue>{user.mobile}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Created:</DetailLabel>
            <DetailValue>
              {new Date(user.createdAt).toLocaleDateString()}
            </DetailValue>
          </DetailRow>
          {user.memberCount > 0 && (
            <DetailRow>
              <DetailLabel>Members:</DetailLabel>
              <DetailValue>{user.memberCount}</DetailValue>
            </DetailRow>
          )}
        </UserDetails>
        <StatusIndicator data-active={user.isActive}>
          <StatusIcon data-active={user.isActive}>
            <FaCircle />
          </StatusIcon>
          {user.isActive ? 'Active' : 'Inactive'}
        </StatusIndicator>
      </UserCard>
      <UserForm
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
        mode='update'
        initialData={user}
      />
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`${user.isActive ? 'Deactivate' : 'Activate'} User`}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>
            Are you sure you want to {user.isActive ? 'deactivate' : 'activate'}{' '}
            user <strong>{user.name}</strong>?
          </p>
          <p style={{ color: '#666' }}>
            {user.isActive
              ? 'The user will no longer be able to access the system.'
              : 'The user will regain access to the system.'}
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '20px',
            }}
          >
            <button
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </button>
            <button
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: user.isActive ? '#d32f2f' : '#2e7d32',
                color: '#fff',
                cursor: 'pointer',
                opacity: isActivating || isDeactivating ? 0.7 : 1,
              }}
              onClick={handleStatusToggle}
              disabled={isActivating || isDeactivating}
            >
              {isActivating || isDeactivating
                ? 'Updating...'
                : user.isActive
                ? 'Deactivate'
                : 'Activate'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
