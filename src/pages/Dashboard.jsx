import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaChartBar, FaCog } from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to Welin Dashboard</h1>
        <p className="dashboard-subtitle">Manage your vendors and monitor system performance</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-card" onClick={() => handleCardClick('/vendors')}>
          <div className="card-icon">
            <FaUsers size={24} />
          </div>
          <h2 className="card-title">Vendor Management</h2>
          <p className="card-description">
            View, add, edit, and manage vendor accounts. Monitor vendor activities and status.
          </p>
          <button className="card-button">Manage Vendors</button>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">
            <FaChartBar size={24} />
          </div>
          <h2 className="card-title">Analytics</h2>
          <p className="card-description">
            View user activity, engagement metrics, and system performance data.
          </p>
          <button className="card-button">View Analytics</button>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">
            <FaCog size={24} />
          </div>
          <h2 className="card-title">Settings</h2>
          <p className="card-description">
            Configure system settings, notifications, and customize your dashboard.
          </p>
          <button className="card-button">Open Settings</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 