import React from 'react';
import { Card } from 'react-bootstrap';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatLoanType = (type) => {
  return (
    type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')
  );
};

const withLoanDisplay = (WrappedComponent) => {
  return function WithLoanDisplay(props) {
    const { user } = props;
    const hasLoans = user.loans && user.loans.length > 0;

    const LoanSection = () => {
      if (!hasLoans) return null;

      return (
        <>
          <hr />
          <div>
            <strong>Loan Details:</strong>
            {user.loans.map((loan, index) => (
              <Card key={loan.id} className='mt-2 mb-2'>
                <Card.Body>
                  <div className='d-flex justify-content-between'>
                    <div>
                      <strong>Type:</strong> {formatLoanType(loan.loanType)}
                    </div>
                    <div>
                      <strong>Amount:</strong> ₹{loan.amount}
                    </div>
                  </div>
                  <div className='d-flex justify-content-between mt-2'>
                    <div>
                      <strong>Start Date:</strong> {formatDate(loan.startDate)}
                    </div>
                    <div>
                      <strong>End Date:</strong> {formatDate(loan.endDate)}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </>
      );
    };

    return (
      <>
        <WrappedComponent {...props} />
        <LoanSection />
      </>
    );
  };
};

export default withLoanDisplay;
