import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import LoanProtectionCalculator from '../../components/LoanProtectionCalculator';

// Example service components
const Service1 = () => <LoanProtectionCalculator />;
const Service2 = () => <div>Service 2 Content</div>;
const Service3 = () => <div>Service 3 Content</div>;

const serviceComponents = {
  'service-1': Service1,
  'service-2': Service2,
  'service-3': Service3,
};

const Services = () => {
  const { serviceId } = useParams();
  const [ServiceComponent, setServiceComponent] = useState(() => Service1);

  useEffect(() => {
    // For now, we'll use hardcoded service IDs
    // Later this can be replaced with dynamic loading based on vendor
    const component = serviceComponents[serviceId] || Service1;
    setServiceComponent(() => component);
  }, [serviceId]);

  return (
    <DashboardLayout title='Services'>
      <div className='p-4'>
        <ServiceComponent />
      </div>
    </DashboardLayout>
  );
};

export default Services;
