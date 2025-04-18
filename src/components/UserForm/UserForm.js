import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import Button from '../Button';
import Modal from '../Modal';
import { toast } from 'react-toastify';
import { useUserForm } from '../../hooks/useUserForm';

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

const UserForm = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    role: 'user',
  });

  const [errors, setErrors] = useState({});
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);

  const { createUser, updateUser, checkMobileExists, isCreating, isUpdating } =
    useUserForm(mode, initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        mobile: initialData.mobile || '',
        role: initialData.role || 'user',
      });
    }
  }, [initialData]);

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

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'create' && !validatePassword(formData.password)) {
      newErrors.password =
        'Password must be at least 6 characters long and contain at least one letter and one number';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    } else if (
      mode === 'create' ||
      (mode === 'update' && formData.mobile !== initialData.mobile)
    ) {
      setIsCheckingMobile(true);
      try {
        const mobileExists = await checkMobileExists(formData.mobile);
        if (mobileExists) {
          newErrors.mobile = 'This mobile number is already registered';
        }
      } catch (error) {
        // Don't block form submission on API error
        console.warn('Mobile number check failed:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm()) {
      const userData = { ...formData };
      if (mode === 'update' && !userData.password) {
        delete userData.password;
      }

      if (mode === 'create') {
        createUser.mutate(userData, {
          onSuccess: () => {
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
        });
      } else {
        updateUser.mutate(
          { userId: initialData._id, userData },
          {
            onSuccess: () => {
              setFormData({
                name: '',
                email: '',
                password: '',
                mobile: '',
                role: 'user',
              });
              setErrors({});
              toast.success('User updated successfully!');
              if (onSuccess) onSuccess();
            },
          }
        );
      }
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'create' ? 'Add' : 'Edit'} User`}
    >
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
        <FormInput
          label='Password'
          name='password'
          type='password'
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required={mode === 'create'}
          placeholder={
            mode === 'update' ? 'Leave blank to keep current password' : ''
          }
        />
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
            disabled={isCreating || isUpdating || isCheckingMobile}
          >
            {isCreating || isUpdating
              ? `${mode === 'create' ? 'Creating' : 'Updating'}...`
              : isCheckingMobile
              ? 'Checking...'
              : mode === 'create'
              ? 'Create User'
              : 'Update User'}
          </Button>
        </ButtonContainer>
      </Form>
    </Modal>
  );
};

export default UserForm;
