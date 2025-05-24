// Vendor Dashboard Page
import DashboardLayout from '../components/DashboardLayout';

import { useAuth } from '../hooks/useAuth';
import { components } from '../constants/componants';

const VendorDashboard = () => {
  const { user } = useAuth();
  const componentId = user.role.componentId;

  const DashboardComponent = components[componentId];

  if (!DashboardComponent) {
    return (
      <DashboardLayout title='Dashboard'>
        <div>No dashboard found for this vendor.</div>
      </DashboardLayout>
    );
  }

  return <DashboardComponent />;
};

export default VendorDashboard;
