import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back
          </button>
          <button onClick={() => navigate('/dashboard')} className="home-button">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 