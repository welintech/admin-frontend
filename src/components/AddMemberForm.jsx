import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col, ProgressBar } from 'react-bootstrap';
import api from '../api';
import LoadingSpinner from './LoadingSpinner';
import { useQuery } from '@tanstack/react-query';

// Validation functions
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePincode = (pincode) => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

const validateName = (name) => {
  return name.length >= 2 && /^[a-zA-Z\s]*$/.test(name);
};

// Relationship options enum
const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
];

// Test data - Easy to remove later by deleting this object
const TEST_DATA = {
  memberName: 'John Doe',
  contactNo: '9876543210',
  email: 'john.doe@example.com',
  dob: '1990-01-01',
  gender: 'male',
  address: {
    street: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  occupation: 'Software Engineer',
  nominee: {
    name: 'Jane Doe',
    relation: 'spouse',
    contactNo: '9876543211',
  },
  loan: {
    loanType: 'personal',
    amount: 100000,
    startDate: '2021-01-01',
    endDate: '2025-01-01',
  },
};

const EMPTY_FORM_DATA = {
  memberName: '',
  contactNo: '',
  email: '',
  dob: '',
  gender: '',
  address: {
    street: '',
    city: '',
    state: '',
    pincode: '',
  },
  occupation: '',
  nominee: {
    name: '',
    relation: '',
    contactNo: '',
  },
  loan: {
    loanType: '',
    amount: '',
    startDate: '',
    endDate: '',
  },
};

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'education', label: 'Education Loan' },
  { value: 'home', label: 'Home Loan' },
  { value: 'other', label: 'Other' },
];

const AddMemberForm = ({
  show,
  onHide,
  onSubmit,
  title = 'Add New Member',
  useTestData = false,
  initialData = null,
  renderLoanForm,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [premiumParams, setPremiumParams] = useState(null);

  const { data: premiumData, isLoading: isCalculatingPremium } = useQuery({
    queryKey: ['premium', premiumParams],
    queryFn: async () => {
      if (!premiumParams) return null;
      const response = await api.get('/premium', {
        params: premiumParams,
      });
      return response.data.data;
    },
    enabled: !!premiumParams,
  });

  useEffect(() => {
    if (premiumData) {
      const { premiumAmount } = premiumData;
      const gst = Math.ceil(premiumAmount * 0.18); // 18% GST rounded up
      const totalPremium = premiumAmount + gst;

      setFormData((prev) => ({
        ...prev,
        loan: {
          ...prev.loan,
          basePremium: premiumAmount,
          gst: gst,
          totalPremium: totalPremium,
          duration: premiumParams.year,
        },
      }));

      // Clear any premium-related errors
      setErrors((prev) => ({
        ...prev,
        premium: null,
      }));
    }
  }, [premiumData, premiumParams]);

  // Reset form data when show, useTestData, or initialData changes
  useEffect(() => {
    if (show) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData(useTestData === 'true' ? TEST_DATA : EMPTY_FORM_DATA);
      }
      setErrors({});
    }
  }, [show, useTestData, initialData]);

  const calculatePremium = () => {
    if (
      !formData.loan.amount ||
      !formData.loan.startDate ||
      !formData.loan.endDate
    ) {
      setErrors((prev) => ({
        ...prev,
        premium: 'Please fill loan amount and dates first',
      }));
      return;
    }

    const startDate = new Date(formData.loan.startDate);
    const endDate = new Date(formData.loan.endDate);
    const year = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 365));

    setPremiumParams({
      loanAmount: formData.loan.amount,
      year: year,
    });
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!validateName(formData.memberName)) {
          newErrors.memberName =
            'Name should be at least 2 characters and contain only letters';
        }
        if (!validatePhoneNumber(formData.contactNo)) {
          newErrors.contactNo =
            'Please enter a valid 10-digit phone number starting with 6-9';
        }
        if (!validateEmail(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.dob) {
          newErrors.dob = 'Date of birth is required';
        } else {
          const dob = new Date(formData.dob);
          const today = new Date();
          if (dob > today) {
            newErrors.dob = 'Date of birth cannot be in the future';
          }
        }
        if (!formData.gender) {
          newErrors.gender = 'Gender is required';
        }
        break;

      case 2:
        if (!formData.address.street.trim()) {
          newErrors['address.street'] = 'Street address is required';
        }
        if (!validateName(formData.address.city)) {
          newErrors['address.city'] = 'City should contain only letters';
        }
        if (!validateName(formData.address.state)) {
          newErrors['address.state'] = 'State should contain only letters';
        }
        if (!validatePincode(formData.address.pincode)) {
          newErrors['address.pincode'] = 'Please enter a valid 6-digit pincode';
        }
        if (!formData.occupation.trim()) {
          newErrors.occupation = 'Occupation is required';
        }
        break;

      case 3:
        if (!validateName(formData.nominee.name)) {
          newErrors['nominee.name'] =
            'Nominee name should be at least 2 characters and contain only letters';
        }
        if (!formData.nominee.relation) {
          newErrors['nominee.relation'] = 'Relationship is required';
        }
        if (!validatePhoneNumber(formData.nominee.contactNo)) {
          newErrors['nominee.contactNo'] =
            'Please enter a valid 10-digit phone number starting with 6-9';
        }
        break;

      case 4:
        if (!formData.loan.loanType) {
          newErrors.loanType = 'Loan type is required';
        }
        if (!formData.loan.amount || formData.loan.amount <= 0) {
          newErrors.amount = 'Please enter a valid amount';
        }
        if (!formData.loan.startDate) {
          newErrors.startDate = 'Start date is required';
        }
        if (!formData.loan.endDate) {
          newErrors.endDate = 'End date is required';
        }
        if (
          formData.loan.startDate &&
          formData.loan.endDate &&
          new Date(formData.loan.startDate) > new Date(formData.loan.endDate)
        ) {
          newErrors.endDate = 'End date must be after start date';
        }
        if (
          !formData.loan.basePremium ||
          !formData.loan.gst ||
          !formData.loan.totalPremium ||
          !formData.loan.duration
        ) {
          newErrors.premium = 'Please calculate premium before proceeding';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData(EMPTY_FORM_DATA);
    setErrors({});
    onHide();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prevState) => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLoanInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for loan type
    if (name === 'loanType') {
      setFormData((prevState) => ({
        ...prevState,
        loan: {
          ...prevState.loan,
          [name]: value,
          // Clear premium values when loan type changes
          basePremium: '',
          gst: '',
          totalPremium: '',
          duration: '',
        },
      }));
      return;
    }

    // Clear premium values if loan amount or dates are changed
    if (name === 'amount' || name === 'startDate' || name === 'endDate') {
      setFormData((prevState) => ({
        ...prevState,
        loan: {
          ...prevState.loan,
          [name]: value,
          basePremium: '',
          gst: '',
          totalPremium: '',
          duration: '',
        },
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        loan: {
          ...prevState.loan,
          [name]: value,
        },
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      // console.log(`Step ${currentStep} Data:`, getStepData(currentStep));
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        const finalData = {
          ...formData,
          loan: formData.loan,
        };
        // console.log('Final Member Data with Loan:', finalData);
        onSubmit(finalData);
      } else {
        handleNext(e);
      }
    }
  };

  const calculateProgress = () => {
    const totalSteps = 4;
    const completedSteps = currentStep - 1;
    return (completedSteps / totalSteps) * 100;
  };

  const renderStep1 = () => (
    <>
      <h5 className='mb-3'>Personal Information</h5>
      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Member Name</Form.Label>
            <Form.Control
              type='text'
              name='memberName'
              value={formData.memberName}
              onChange={handleInputChange}
              isInvalid={!!errors.memberName}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors.memberName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type='tel'
              name='contactNo'
              value={formData.contactNo}
              onChange={handleInputChange}
              isInvalid={!!errors.contactNo}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors.contactNo}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              isInvalid={!!errors.email}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type='date'
              name='dob'
              value={formData.dob}
              onChange={handleInputChange}
              isInvalid={!!errors.dob}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors.dob}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name='gender'
              value={formData.gender}
              onChange={handleInputChange}
              isInvalid={!!errors.gender}
              required
            >
              <option value=''>Select Gender</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
              <option value='other'>Other</option>
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {errors.gender}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  const renderStep2 = () => (
    <>
      <h5 className='mb-3'>Address & Occupation</h5>
      <Row>
        <Col md={12}>
          <Form.Group className='mb-3'>
            <Form.Label>Street Address</Form.Label>
            <Form.Control
              type='text'
              name='address.street'
              value={formData.address.street}
              onChange={handleInputChange}
              isInvalid={!!errors['address.street']}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors['address.street']}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>City</Form.Label>
            <Form.Control
              type='text'
              name='address.city'
              value={formData.address.city}
              onChange={handleInputChange}
              isInvalid={!!errors['address.city']}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors['address.city']}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>State</Form.Label>
            <Form.Control
              type='text'
              name='address.state'
              value={formData.address.state}
              onChange={handleInputChange}
              isInvalid={!!errors['address.state']}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors['address.state']}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Pincode</Form.Label>
            <Form.Control
              type='text'
              name='address.pincode'
              value={formData.address.pincode}
              onChange={handleInputChange}
              isInvalid={!!errors['address.pincode']}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors['address.pincode']}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Occupation</Form.Label>
            <Form.Control
              type='text'
              name='occupation'
              value={formData.occupation}
              onChange={handleInputChange}
              isInvalid={!!errors.occupation}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors.occupation}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  const renderStep3 = () => (
    <>
      <h5 className='mb-3'>Nominee Information</h5>
      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Nominee Name</Form.Label>
            <Form.Control
              type='text'
              name='nominee.name'
              value={formData.nominee.name}
              onChange={handleInputChange}
              isInvalid={!!errors['nominee.name']}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors['nominee.name']}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Relation</Form.Label>
            <Form.Select
              name='nominee.relation'
              value={formData.nominee.relation}
              onChange={handleInputChange}
              isInvalid={!!errors['nominee.relation']}
              required
            >
              <option value=''>Select Relationship</option>
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {errors['nominee.relation']}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Nominee Contact Number</Form.Label>
            <Form.Control
              type='tel'
              name='nominee.contactNo'
              value={formData.nominee.contactNo}
              onChange={handleInputChange}
              isInvalid={!!errors['nominee.contactNo']}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors['nominee.contactNo']}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {renderLoanForm && renderLoanForm(formData)}
    </>
  );

  const renderStep4 = () => (
    <>
      <h5 className='mb-3'>Loan Information</h5>
      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Loan Type</Form.Label>
            {formData.loan.loanType === 'other' ||
            (formData.loan.loanType &&
              !LOAN_TYPES.some(
                (type) => type.value === formData.loan.loanType
              )) ? (
              <Form.Control
                type='text'
                name='loanType'
                value={
                  formData.loan.loanType === 'other'
                    ? ''
                    : formData.loan.loanType
                }
                onChange={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    loan: {
                      ...prevState.loan,
                      loanType: e.target.value,
                      basePremium: '',
                      gst: '',
                      totalPremium: '',
                      duration: '',
                    },
                  }));
                }}
                placeholder='Enter loan type'
                required
              />
            ) : (
              <Form.Select
                name='loanType'
                value={formData.loan.loanType}
                onChange={handleLoanInputChange}
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
            )}
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
              value={formData.loan.amount}
              onChange={handleLoanInputChange}
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
              value={formData.loan.startDate}
              onChange={handleLoanInputChange}
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
              value={formData.loan.endDate}
              onChange={handleLoanInputChange}
              isInvalid={!!errors.endDate}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {errors.endDate}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className='mt-3'>
        <Col md={12}>
          {isCalculatingPremium ? (
            <div className='d-flex align-items-center gap-2'>
              <LoadingSpinner />
              <span>Calculating Premium...</span>
            </div>
          ) : (
            <Button
              variant='primary'
              onClick={calculatePremium}
              disabled={
                isCalculatingPremium ||
                !formData.loan.amount ||
                !formData.loan.startDate ||
                !formData.loan.endDate
              }
            >
              Calculate Premium
            </Button>
          )}
          {errors.premium && (
            <div className='text-danger mt-2'>{errors.premium}</div>
          )}
        </Col>
      </Row>

      {formData.loan.duration && (
        <Row className='mt-3'>
          <Col md={12}>
            <div className='alert alert-info'>
              Premium calculated for {formData.loan.duration} year
              {formData.loan.duration > 1 ? 's' : ''} loan duration
            </div>
          </Col>
        </Row>
      )}

      <Row className='mt-3'>
        <Col md={4}>
          <Form.Group className='mb-3'>
            <Form.Label>Base Premium (₹)</Form.Label>
            <Form.Control
              type='number'
              value={formData.loan.basePremium || ''}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className='mb-3'>
            <Form.Label>GST (₹)</Form.Label>
            <Form.Control
              type='number'
              value={formData.loan.gst || ''}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className='mb-3'>
            <Form.Label>Total Premium (₹)</Form.Label>
            <Form.Control
              type='number'
              value={formData.loan.totalPremium || ''}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  return (
    <Modal show={show} onHide={handleClose} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>
          {title} - Step {currentStep} of 4
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProgressBar
          now={calculateProgress()}
          className='mb-4'
          label={`${Math.round(calculateProgress())}%`}
        />
        <Form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className='d-flex justify-content-between mt-4'>
            <Button variant='secondary' onClick={handleClose} type='button'>
              Cancel
            </Button>
            <div className='d-flex gap-2'>
              {currentStep > 1 && (
                <Button
                  variant='secondary'
                  onClick={handlePrevious}
                  type='button'
                >
                  Previous
                </Button>
              )}
              <Button variant='primary' type='submit'>
                Next
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddMemberForm;
