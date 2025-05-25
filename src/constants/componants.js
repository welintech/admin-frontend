import Tirumalla from '../dashboards/Tirumalla/Tirumalla';
import TirumallaAdmin from '../dashboards/Tirumalla/TirumallaAdmin';
import AdminDashboard from '../pages/AdminDashboard';

export const components = {
  'tirumalla-admin': TirumallaAdmin,
  'tirumalla-agent': Tirumalla,
};

export const displayComponents = ['tirumalla-admin'];
