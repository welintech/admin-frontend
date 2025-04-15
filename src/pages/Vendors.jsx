import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorsAPI } from '../services/api';
import { format } from 'date-fns';
import VendorForm from '../components/VendorForm';
import './Vendors.css';

const Vendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVendorForm, setShowVendorForm] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await vendorsAPI.getAllVendors();
        setVendors(data.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleAddVendor = () => {
    setShowVendorForm(true);
  };

  const handleCloseForm = () => {
    setShowVendorForm(false);
  };

  const handleVendorSubmit = async (vendorData) => {
    try {
      // Add API call here when ready
      // const response = await vendorsAPI.createVendor(vendorData);
      // setVendors(prevVendors => [...prevVendors, response.data]);
      setShowVendorForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create vendor');
    }
  };

  const handleViewMembers = (vendorId) => {
    navigate(`/vendors/${vendorId}/members`);
  };

  if (loading) {
    return (
      <div className="vendors-loading">
        <div className="loading-spinner"></div>
        <p>Loading vendors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendors-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="vendors-container">
      <div className="vendors-header">
        <h1>Vendors</h1>
        <button className="add-vendor-button" onClick={handleAddVendor}>Add New Vendor</button>
      </div>

      <div className="vendors-grid">
        {vendors.map((vendor) => (
          <div key={vendor._id} className="vendor-card">
            <div className="vendor-card-header">
              <h2>{vendor.name}</h2>
              <span className={`status-badge ${vendor.isActive ? 'active' : 'inactive'}`}>
                {vendor.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="vendor-card-content">
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{vendor.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{vendor.phone}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address:</span>
                <span className="info-value">{vendor.address}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Created:</span>
                <span className="info-value">{formatDate(vendor.createdAt)}</span>
              </div>
            </div>

            <div className="vendor-card-footer">
              <button className="edit-button">Edit</button>
              <button 
                className="view-button"
                onClick={() => handleViewMembers(vendor._id)}
              >
                View Members
              </button>
            </div>
          </div>
        ))}
      </div>

      {vendors.length === 0 && !loading && !error && (
        <div className="no-vendors">
          <p>No vendors found</p>
        </div>
      )}

      {showVendorForm && (
        <VendorForm
          onClose={handleCloseForm}
          onSubmit={handleVendorSubmit}
        />
      )}
    </div>
  );
};

export default Vendors;