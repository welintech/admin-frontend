import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorsAPI } from '../services/api';
import './Members.css';

const Members = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await vendorsAPI.getVendorMembers(vendorId, page, limit, search);
        setMembers(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [vendorId, page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleBack = () => {
    navigate('/vendors');
  };

  if (loading) {
    return (
      <div className="members-loading">
        <div className="loading-spinner"></div>
        <p>Loading members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="members-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="members-container">
      <div className="members-header">
        <button className="back-button" onClick={handleBack}>← Back to Vendors</button>
        <h1>Vendor Members</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      <div className="members-list">
        {members.map((member) => (
          <div key={member._id} className="member-card">
            <div className="member-info">
              <h3>{member.name}</h3>
              <p><strong>Email:</strong> {member.email}</p>
              <p><strong>Phone:</strong> {member.phone}</p>
              <p><strong>Address:</strong> {member.address}</p>
            </div>
            <div className="member-status">
              <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="no-members">
            <p>No members found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;