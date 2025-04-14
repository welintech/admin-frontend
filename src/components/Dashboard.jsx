import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { getVendors } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchVendors();
  }, [navigate]);

  const fetchVendors = async () => {
    try {
      const response = await getVendors();
      if (response.success) {
        setVendors(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch vendors');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch vendors');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleVendorClick = (vendorId) => {
    navigate(`/vendor/${vendorId}/members`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Welin Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {vendors.map((vendor) => (
            <Grid item xs={12} sm={6} md={4} key={vendor._id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleVendorClick(vendor._id)}
              >
                <CardContent>
                  <Typography variant="h6" component="div">
                    {vendor.name}
                  </Typography>
                  <Typography color="text.secondary">
                    Email: {vendor.email}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Total Members: {vendor.memberCount || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard; 