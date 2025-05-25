import React, { useState } from 'react';
import { Modal, Form, Alert } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../api';
import Button from './Button';
import { displayComponents } from '../constants/componants';

const AddVendorForm = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: {
      role: 'vendor',
      componentId: '', // No default value
    },
  });
  const [validationErrors, setValidationErrors] = useState({});
  const queryClient = useQueryClient();

  const validateName = (name) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (name.trim().length > 50) {
      return 'Name must not exceed 50 characters';
    }
    if (!/^[a-zA-Z\s]*$/.test(name.trim())) {
      return 'Name should only contain letters and spaces';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())
    ) {
      return 'Please enter a valid email address';
    }
    if (email.trim().length > 100) {
      return 'Email must not exceed 100 characters';
    }
    return '';
  };

  const validateMobile = (mobile) => {
    if (!mobile) {
      return 'Mobile number is required';
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      return 'Mobile number must be exactly 10 digits';
    }
    if (!/^[6-9]/.test(mobile)) {
      return 'Mobile number must start with 6, 7, 8, or 9';
    }
    return '';
  };

  const validateForm = () => {
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      mobile: validateMobile(formData.mobile),
      componentId: !formData.role.componentId
        ? 'Please select a component'
        : '',
    };

    setValidationErrors(errors);
    return !Object.values(errors).some((error) => error !== '');
  };

  const createVendorMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/admin/user', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Vendor created successfully');
      queryClient.invalidateQueries(['vendors']);
      onHide();
      setFormData({
        name: '',
        email: '',
        mobile: '',
        role: {
          role: 'vendor',
          componentId: '', // Reset to empty
        },
      });
      setValidationErrors({});
    },
    onError: (error) => {
      if (error.message === 'Email already exists') {
        setValidationErrors((prev) => ({
          ...prev,
          email: 'This email is already registered',
        }));
      } else {
        toast.error(error.response?.data?.message || 'Failed to create vendor');
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      createVendorMutation.mutate(formData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'componentId') {
      setFormData((prev) => ({
        ...prev,
        role: {
          ...prev.role,
          componentId: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Validate the field as user types
    let error = '';
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'mobile':
        error = validateMobile(value);
        break;
      case 'componentId':
        error = !value ? 'Please select a component' : '';
        break;
      default:
        break;
    }

    setValidationErrors((prev) => ({ ...prev, [name]: error }));
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Vendor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className='mb-3'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type='text'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.name}
              disabled={createVendorMutation.isPending}
              placeholder='Enter vendor name'
              maxLength={50}
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.email}
              disabled={createVendorMutation.isPending}
              placeholder='Enter email address'
              maxLength={100}
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Mobile Number</Form.Label>
            <Form.Control
              type='tel'
              name='mobile'
              value={formData.mobile}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.mobile}
              disabled={createVendorMutation.isPending}
              placeholder='Enter 10-digit mobile number'
              maxLength={10}
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.mobile}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Component</Form.Label>
            <Form.Select
              name='componentId'
              value={formData.role.componentId}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.componentId}
              disabled={createVendorMutation.isPending}
            >
              <option value=''>Select a component</option>
              {displayComponents.map((id) => (
                <option key={id} value={id}>
                  {id
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {validationErrors.componentId}
            </Form.Control.Feedback>
          </Form.Group>

          <div className='d-flex justify-content-end gap-2'>
            <Button
              variant='secondary'
              onClick={onHide}
              disabled={createVendorMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={createVendorMutation.isPending}
            >
              {createVendorMutation.isPending ? 'Creating...' : 'Create Vendor'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddVendorForm;
