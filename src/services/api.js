import axios from 'axios';

const API_BASE_URL = 'https://welin-dashboard-backend-493mx.ondigitalocean.app/api';
// const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Make sure the token is in the correct format
    config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.success) {
      // Store the complete token string (including "Bearer" prefix)
      localStorage.setItem('token', response.data.data.token);
      return response.data;
    }
    throw new Error(response.data.message);
  } catch (error) {
    throw error;
  }
};

export const getVendors = async () => {
  try {
    const response = await api.get('/vendors');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getVendorMembers = async (vendorId) => {
  try {
    const response = await api.get(`/vendors/${vendorId}/members`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api; 