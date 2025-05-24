import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const DisplayUser = ({ user, onEdit, renderAdditionalContent }) => {
  const renderLoanDetails = () => {
    if (!user.loan) return null;

    return (
      <div className='mt-3 border-top pt-3'>
        <h6>Loan Details</h6>
        <div className='row'>
          <div className='col-md-6'>
            <p className='mb-1'>
              <strong>Type:</strong> {user.loan.loanType}
            </p>
            <p className='mb-1'>
              <strong>Amount:</strong> ₹{user.loan.amount.toLocaleString()}
            </p>
            <p className='mb-1'>
              <strong>Duration:</strong> {user.loan.duration} year
              {user.loan.duration > 1 ? 's' : ''}
            </p>
          </div>
          <div className='col-md-6'>
            <p className='mb-1'>
              <strong>Start Date:</strong> {formatDate(user.loan.startDate)}
            </p>
            <p className='mb-1'>
              <strong>End Date:</strong> {formatDate(user.loan.endDate)}
            </p>
          </div>
        </div>

        {user.loan.basePremium && (
          <div className='row mt-3'>
            <div className='col-12'>
              <h6 className='mb-2'>Premium Details</h6>
              <div className='table-responsive'>
                <table className='table table-bordered table-sm'>
                  <thead className='table-light'>
                    <tr>
                      <th>Base Premium</th>
                      <th>GST (18%)</th>
                      <th>Total Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>₹{user.loan.basePremium.toLocaleString()}</td>
                      <td>₹{user.loan.gst.toLocaleString()}</td>
                      <td>₹{user.loan.totalPremium.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className='mb-3'>
      <Card.Body>
        <div className='d-flex justify-content-between align-items-start mb-3'>
          <div>
            <Card.Title className='mb-1'>{user.memberName}</Card.Title>
            <Card.Subtitle className='mb-2 text-muted'>
              {user.occupation}
            </Card.Subtitle>
          </div>
          <div className='d-flex gap-2'>
            {renderAdditionalContent &&
              renderAdditionalContent(user, 'buttons')}
          </div>
        </div>

        <Row>
          <Col md={6}>
            <div className='mb-2'>
              <strong>Contact:</strong> {user.contactNo}
            </div>
            <div className='mb-2'>
              <strong>Email:</strong> {user.email}
            </div>
            <div className='mb-2'>
              <strong>Date of Birth:</strong> {formatDate(user.dob)}
            </div>
            <div className='mb-2'>
              <strong>Gender:</strong>{' '}
              {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
            </div>
          </Col>
          <Col md={6}>
            <div className='mb-2'>
              <strong>Address:</strong>
              <div className='ms-2'>
                {user.address.street}
                <br />
                {user.address.city}, {user.address.state}
                <br />
                Pincode: {user.address.pincode}
              </div>
            </div>
          </Col>
        </Row>

        <hr />

        <div>
          <strong>Nominee Details:</strong>
          <Row className='mt-2'>
            <Col md={6}>
              <div className='mb-2'>
                <strong>Name:</strong> {user.nominee.name}
              </div>
              <div className='mb-2'>
                <strong>Relation:</strong>{' '}
                {user.nominee.relation.charAt(0).toUpperCase() +
                  user.nominee.relation.slice(1)}
              </div>
            </Col>
            <Col md={6}>
              <div className='mb-2'>
                <strong>Contact:</strong> {user.nominee.contactNo}
              </div>
            </Col>
          </Row>
        </div>

        {renderLoanDetails()}
        {renderAdditionalContent &&
          renderAdditionalContent(user, 'loanSection')}
      </Card.Body>
    </Card>
  );
};

export default DisplayUser;
