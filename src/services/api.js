import axios from 'axios';

const API_BASE_URL = 'https://welin-dashboard-backend-493mx.ondigitalocean.app/api';

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
};

// Add more API sections here as needed
// Example:
// export const userAPI = { ... }
// export const contentAPI = { ... }

export default api; 