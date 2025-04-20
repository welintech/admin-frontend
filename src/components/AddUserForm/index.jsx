import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import Button from '../Button';
import Modal from '../Modal';
import api from '../../api';
import { toast } from 'react-toastify';
import PasswordInput from '../PasswordInput';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'admin', label: 'Admin' },
];

const createUser = async (userData) => {
  const response = await api.post('/admin/user', userData);
  return response.data;
};

const checkMobileExists = async (mobile) => {
  try {
    const response = await api.get(`/admin/user/check-mobile/${mobile}`);
    return response.data.exists;
  } catch (error) {
    console.error('Error checking mobile number:', error);
    return false;
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMobile = (mobile) => {
  const mobileRegex = /^[0-9]{10}$/;
  return mobileRegex.test(mobile);
};

const validatePassword = (password) => {
  // At least 6 characters, at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return passwordRegex.test(password);
};

const validateName = (name) => {
  // Name should contain only letters and spaces, at least 2 characters
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name);
};

const AddUserForm = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    role: 'user',
  });

  const [errors, setErrors] = useState({});
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name =
        'Name should contain only letters and spaces, at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        'Password must be at least 6 characters long and contain at least one letter and one number';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    } else {
      setIsCheckingMobile(true);
      try {
        const mobileExists = await checkMobileExists(formData.mobile);
        if (mobileExists) {
          newErrors.mobile = 'This mobile number is already registered';
        }
      } catch (error) {
        newErrors.mobile = 'Error checking mobile number availability';
      } finally {
        setIsCheckingMobile(false);
      }
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCounts'] });
      setFormData({
        name: '',
        email: '',
        password: '',
        mobile: '',
        role: 'user',
      });
      setErrors({});
      toast.success('User created successfully!');
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm()) {
      mutation.mutate(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Add New User'>
      <Form onSubmit={handleSubmit}>
        <FormInput
          label='Name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <FormInput
          label='Email'
          name='email'
          type='email'
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Password
          </label>
          <PasswordInput
            name='password'
            value={formData.password}
            onChange={handleChange}
            placeholder='Enter password'
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
          />
          {errors.password && (
            <p className='mt-1 text-sm text-red-600'>{errors.password}</p>
          )}
        </div>
        <FormInput
          label='Mobile Number'
          name='mobile'
          type='tel'
          value={formData.mobile}
          onChange={handleChange}
          error={errors.mobile}
          required
          disabled={isCheckingMobile}
        />
        <FormSelect
          label='Role'
          name='role'
          value={formData.role}
          onChange={handleChange}
          options={roleOptions}
          error={errors.role}
          required
        />
        <ButtonContainer>
          <Button
            type='submit'
            disabled={mutation.isPending || isCheckingMobile}
          >
            {mutation.isPending
              ? 'Creating...'
              : isCheckingMobile
              ? 'Checking...'
              : 'Create User'}
          </Button>
        </ButtonContainer>
      </Form>
    </Modal>
  );
};

export default AddUserForm;
