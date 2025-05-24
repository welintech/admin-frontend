import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import FormInput from '../FormInput';
import Button from '../Button';
import Modal from '../Modal';
import api from '../../api';
import { toast } from 'react-toastify';

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

const createAgent = async (agentData) => {
  const response = await api.post('/agent', agentData);
  return response.data;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMobile = (mobile) => {
  const mobileRegex = /^[0-9]{10}$/;
  return mobileRegex.test(mobile);
};

const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name);
};

const AddAgentForm = ({ isOpen, onClose, onSuccess, componentId }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: {
      role: 'agent',
      componentId: componentId,
    },
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

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      setFormData({
        name: '',
        email: '',
        mobile: '',
        role: {
          componentId: componentId,
          role: 'agent',
        },
      });
      setErrors({});
      toast.success('Agent created successfully!');
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create agent');
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Add New Agent'>
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
          label='Mobile Number'
          name='mobile'
          type='tel'
          value={formData.mobile}
          onChange={handleChange}
          error={errors.mobile}
          required
          disabled={isCheckingMobile}
        />
        <ButtonContainer>
          <Button type='submit' disabled={isCheckingMobile}>
            {isCheckingMobile ? 'Checking...' : 'Create Agent'}
          </Button>
        </ButtonContainer>
      </Form>
    </Modal>
  );
};

export default AddAgentForm;
