import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import PrivateRoute from './components/PrivateRoute';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <div className='min-h-screen bg-gray-100'>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route
          path='/admin'
          element={
            <PrivateRoute role='admin'>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path='/vendor'
          element={
            <PrivateRoute role='vendor'>
              <VendorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path='/agent'
          element={
            <PrivateRoute role='agent'>
              <VendorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path='/admin/users'
          element={
            <PrivateRoute role='admin'>
              <UsersPage />
            </PrivateRoute>
          }
        />
        <Route path='/' element={<Navigate to='/login' replace />} />
      </Routes>
    </div>
  );
}

export default App;
