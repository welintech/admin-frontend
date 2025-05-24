import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

const EMPTY_LOAN_DATA = {
  loanType: '',
  amount: '',
  startDate: '',
  endDate: '',
};

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'education', label: 'Education Loan' },
  { value: 'home', label: 'Home Loan' },
];

const LoanForm = ({
  show,
  onHide,
  onSubmit,
  memberName,
  initialData,
  isEditing,
}) => {
  const [formData, setFormData] = useState(EMPTY_LOAN_DATA);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData(EMPTY_LOAN_DATA);
      }
      setErrors({});
    }
  }, [show, initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.loanType) {
      newErrors.loanType = 'Loan type is required';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData(EMPTY_LOAN_DATA);
    setErrors({});
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? 'Edit Loan' : 'Add Loan'} for {memberName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label>Loan Type</Form.Label>
                <Form.Select
                  name='loanType'
                  value={formData.loanType}
                  onChange={handleInputChange}
                  isInvalid={!!errors.loanType}
                  required
                >
                  <option value=''>Select Loan Type</option>
                  {LOAN_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type='invalid'>
                  {errors.loanType}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label>Amount (₹)</Form.Label>
                <Form.Control
                  type='number'
                  name='amount'
                  value={formData.amount}
                  onChange={handleInputChange}
                  isInvalid={!!errors.amount}
                  required
                  min='0'
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.amount}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type='date'
                  name='startDate'
                  value={formData.startDate}
                  onChange={handleInputChange}
                  isInvalid={!!errors.startDate}
                  required
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.startDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className='mb-3'>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type='date'
                  name='endDate'
                  value={formData.endDate}
                  onChange={handleInputChange}
                  isInvalid={!!errors.endDate}
                  required
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.endDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className='d-flex justify-content-end gap-2 mt-3'>
            <Button variant='secondary' onClick={handleClose}>
              Cancel
            </Button>
            <Button variant='primary' type='submit'>
              {isEditing ? 'Update' : 'Submit'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoanForm;
