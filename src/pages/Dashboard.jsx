import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to Welin Dashboard</h1>
        <p className="dashboard-subtitle">Manage your users and content from here</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2 className="card-title">User Management</h2>
          <p className="card-description">
            View, add, edit, and delete user accounts. Manage user permissions and roles.
          </p>
          <button className="card-button">Manage Users</button>
        </div>
        
        <div className="dashboard-card">
          <h2 className="card-title">Analytics</h2>
          <p className="card-description">
            View user activity, engagement metrics, and system performance data.
          </p>
          <button className="card-button">View Analytics</button>
        </div>
        
        <div className="dashboard-card">
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