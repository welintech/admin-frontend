import axios from 'axios';

const API_BASE_URL = 'https://welin-dashboard-backend-493mx.ondigitalocean.app/api';
// const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth related API calls
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Vendors related API calls
export const vendorsAPI = {
  getAllVendors: async () => {
    try {
      const response = await api.get('/vendors');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  registerVendor: async (vendorData) => {
    try {
      const response = await api.post('/auth/register', {
        username: vendorData.username,
        password: vendorData.password,
        role: 'vendor',
        vendorData: {
          name: vendorData.name,
          email: vendorData.email,
          phone: vendorData.phone,
          address: vendorData.address
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getVendorMembers: async (vendorId, page = 1, limit = 10, search = '') => {
    try {
      const response = await api.get(`/vendors/${vendorId}/members`, {
        params: {
          page,
          limit,
          search
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;