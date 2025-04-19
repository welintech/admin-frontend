import { createContext, useContext, useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password, endpoint = '/auth/login' }) => {
      setLoading(true);
      const response = await api.post(endpoint, { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.success && data?.data) {
        try {
          const { user, token } = data.data;
          if (!user || !token) {
            throw new Error('Invalid response structure');
          }

          setUser(user);
          setToken(token);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          toast.success('Login successful');

          // Navigate based on user role or default to dashboard
          const role = user?.role;
          navigate(`/${role}`);
        } catch (error) {
          console.error('Error saving auth data:', error);
          toast.error('Error processing login response');
        }
      } else {
        toast.error(data?.message || 'Login failed');
      }
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
      setLoading(false);
    },
  });

  const login = ({ email, password, endpoint = '/auth/login' }) => {
    loginMutation.mutate({ email, password, endpoint });
  };

  const logout = () => {
    try {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
