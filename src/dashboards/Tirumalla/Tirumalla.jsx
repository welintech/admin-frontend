import React, { useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import DashboardLayout from '../../components/DashboardLayout';
import AddMemberForm from '../../components/AddMemberForm';
import DisplayUser from '../../components/DisplayUser';
import MembersTable from '../../components/MembersTable';
import { useAuth } from '../../hooks/useAuth';
import { useCreateMember } from '../../hooks/useMemberApi';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api';

const formatErrorMessage = (error) => {
  // If it's an HTML error response
  if (error.response?.data?.includes('<!DOCTYPE html>')) {
    return 'Server error occurred. Please try again later.';
  }

  // If it's a regular error response
  if (!error.response?.data?.message) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorMessage = error.response.data.message;

  // Handle duplicate key errors
  if (errorMessage.includes('duplicate key error')) {
    const fieldMatch = errorMessage.match(/dup key: { ([^:]+): "([^"]+)" }/);
    if (fieldMatch) {
      const [, field, value] = fieldMatch;
      const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase(); // Convert camelCase to spaces
      return `A member with this ${fieldName} (${value}) already exists. Please use a different ${fieldName}.`;
    }
  }

  // Handle validation errors
  if (errorMessage.includes('validation failed')) {
    return 'Please check your input and try again.';
  }

  // Handle TypeError from backend
  if (errorMessage.includes('TypeError')) {
    return 'Server error occurred. Please try again later.';
  }

  // Default error message
  return errorMessage || 'Failed to save member. Please try again.';
};

const Tirumalla = () => {
  const [showModal, setShowModal] = useState(false);
  const [useTestData, setUseTestData] = useState(
    import.meta.env.VITE_REACT_DEV
  );
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [formData, setFormData] = useState(null);

  const { user } = useAuth();
  const createMember = useCreateMember();

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['members', user.id],
    queryFn: async () => {
      const response = await api.get(`/member/agent/${user._id}`);
      return response.data.data;
    },
  });

  const handleShow = () => {
    setShowModal(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setPreviewData(null);
    setFormData(null);
  };

  const handleHide = () => {
    setShowModal(false);
    setPreviewData(null);
    setFormData(null);
  };

  const handleFormSubmit = (formData) => {
    setPreviewData({
      ...formData,
      id: Date.now(),
    });
    setFormData(formData);
    setShowModal(false);
  };

  const handleConfirmSubmit = async () => {
    try {
      const response = await createMember.mutateAsync({
        ...previewData,
        vendorId: user.vendorId,
      });

      setSuccessMessage({
        memberName: previewData.memberName,
        contactNo: previewData.contactNo,
        email: previewData.email,
        memberId: response.data.welinId,
      });

      setPreviewData(null);
      setFormData(null);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error saving member:', error);
      const formattedError = formatErrorMessage(error);
      setErrorMessage(formattedError);
    }
  };

  const handleBackToEdit = () => {
    setShowModal(true);
    setPreviewData(null);
    setErrorMessage(null);
  };

  return (
    <DashboardLayout title='Tirumalla Dashboard'>
      <div className='p-4'>
        <div className='d-flex gap-2 mb-3'>
          <Button variant='primary' onClick={handleShow}>
            Add Member
          </Button>
          {useTestData === 'true' && (
            <Form.Check
              type='switch'
              id='test-data-switch'
              label='Use Test Data'
              checked={true}
              onChange={(e) => setUseTestData(e.target.checked)}
            />
          )}
        </div>

        {errorMessage && (
          <Alert
            variant='danger'
            className='mt-3'
            onClose={() => setErrorMessage(null)}
            dismissible
          >
            <Alert.Heading>Error!</Alert.Heading>
            <p>{errorMessage}</p>
          </Alert>
        )}

        {previewData && (
          <div className='mt-4'>
            <h5>Preview Member Details</h5>
            {createMember.isPending ? (
              <div
                className='d-flex justify-content-center align-items-center'
                style={{ minHeight: '200px' }}
              >
                <LoadingSpinner />
              </div>
            ) : (
              <DisplayUser
                user={previewData}
                renderAdditionalContent={(user, section) => {
                  if (section === 'buttons') {
                    return (
                      <div className='d-flex gap-2'>
                        <Button
                          variant='success'
                          size='sm'
                          onClick={handleConfirmSubmit}
                          disabled={createMember.isPending}
                        >
                          {createMember.isPending
                            ? 'Submitting...'
                            : 'Confirm & Submit'}
                        </Button>
                        <Button
                          variant='outline-secondary'
                          size='sm'
                          onClick={handleBackToEdit}
                          disabled={createMember.isPending}
                        >
                          Back to Edit
                        </Button>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            )}
          </div>
        )}

        {successMessage && (
          <Alert variant='success' className='mt-3'>
            <Alert.Heading>Member Added Successfully!</Alert.Heading>
            <p>Member details:</p>
            <ul className='mb-0'>
              <li>
                <strong>welinId:</strong> {successMessage.memberId}
              </li>
              <li>
                <strong>Name:</strong> {successMessage.memberName}
              </li>
              <li>
                <strong>Contact:</strong> {successMessage.contactNo}
              </li>
              <li>
                <strong>Email:</strong> {successMessage.email}
              </li>
            </ul>
          </Alert>
        )}

        <div className='mt-4'>
          <h5>Members List</h5>
          {isLoadingMembers ? (
            <div
              className='d-flex justify-content-center align-items-center'
              style={{ minHeight: '200px' }}
            >
              <LoadingSpinner />
            </div>
          ) : (
            <MembersTable data={members || []} isLoading={isLoadingMembers} />
          )}
        </div>

        <AddMemberForm
          show={showModal}
          onHide={handleHide}
          onSubmit={handleFormSubmit}
          title='Add New Member'
          useTestData={useTestData}
          initialData={formData}
        />
      </div>
    </DashboardLayout>
  );
};

export default Tirumalla;
