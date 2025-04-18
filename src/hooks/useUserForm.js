import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'react-toastify';

export const useUserForm = (mode = 'create', initialData = null) => {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/admin/user', userData);
      return response.data;
    },
    onMutate: async (newUser) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['adminCounts'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['users']);
      const previousStats = queryClient.getQueryData(['adminCounts']);

      // Optimistically update to the new value
      queryClient.setQueryData(['users'], (old) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: [
              ...old.data.data,
              { ...newUser, _id: Date.now().toString() },
            ],
          },
        };
      });

      // Optimistically update stats
      queryClient.setQueryData(['adminCounts'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            activeUsers: (old.data.activeUsers || 0) + 1,
          },
        };
      });

      return { previousUsers, previousStats };
    },
    onError: (err, newUser, context) => {
      // Revert back to the previous value
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(['adminCounts'], context.previousStats);
      }
      toast.error(err.response?.data?.message || 'Failed to create user');
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminCounts'] });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ userId, userData }) => {
      const response = await api.put(`/admin/user/${userId}`, userData);
      return response.data;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['adminCounts'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['users']);

      // Optimistically update to the new value
      queryClient.setQueryData(['users'], (old) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((user) =>
              user._id === variables.userId
                ? { ...user, ...variables.userData }
                : user
            ),
          },
        };
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // Revert back to the previous value
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      toast.error(err.response?.data?.message || 'Failed to update user');
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminCounts'] });
    },
  });

  const activateUser = useMutation({
    mutationFn: async (userId) => {
      const response = await api.patch(`/admin/user/${userId}/activate`);
      return response.data;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['adminCounts'] });
      await queryClient.cancelQueries({ queryKey: ['vendors'] });

      const previousUsers = queryClient.getQueryData(['users']);
      const previousStats = queryClient.getQueryData(['adminCounts']);
      const previousVendors = queryClient.getQueryData(['vendors']);

      queryClient.setQueryData(['users'], (old) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((user) =>
              user._id === userId ? { ...user, isActive: true } : user
            ),
          },
        };
      });

      queryClient.setQueryData(['adminCounts'], (old) => {
        if (!old?.data) return old;
        const user = previousUsers?.data?.data?.find((u) => u._id === userId);
        return {
          ...old,
          data: {
            ...old.data,
            activeUsers:
              user?.role === 'user'
                ? (old.data.activeUsers || 0) + 1
                : old.data.activeUsers,
            activeVendors:
              user?.role === 'vendor'
                ? (old.data.activeVendors || 0) + 1
                : old.data.activeVendors,
          },
        };
      });

      return { previousUsers, previousStats, previousVendors };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(['adminCounts'], context.previousStats);
      }
      if (context?.previousVendors) {
        queryClient.setQueryData(['vendors'], context.previousVendors);
      }
      toast.error(err.response?.data?.message || 'Error activating user');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminCounts'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  const deactivateUser = useMutation({
    mutationFn: async (userId) => {
      const response = await api.patch(`/admin/user/${userId}/deactivate`);
      return response.data;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['adminCounts'] });
      await queryClient.cancelQueries({ queryKey: ['vendors'] });

      const previousUsers = queryClient.getQueryData(['users']);
      const previousStats = queryClient.getQueryData(['adminCounts']);
      const previousVendors = queryClient.getQueryData(['vendors']);

      queryClient.setQueryData(['users'], (old) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((user) =>
              user._id === userId ? { ...user, isActive: false } : user
            ),
          },
        };
      });

      queryClient.setQueryData(['adminCounts'], (old) => {
        if (!old?.data) return old;
        const user = previousUsers?.data?.data?.find((u) => u._id === userId);
        return {
          ...old,
          data: {
            ...old.data,
            activeUsers:
              user?.role === 'user'
                ? (old.data.activeUsers || 0) - 1
                : old.data.activeUsers,
            activeVendors:
              user?.role === 'vendor'
                ? (old.data.activeVendors || 0) - 1
                : old.data.activeVendors,
          },
        };
      });

      return { previousUsers, previousStats, previousVendors };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(['adminCounts'], context.previousStats);
      }
      if (context?.previousVendors) {
        queryClient.setQueryData(['vendors'], context.previousVendors);
      }
      toast.error(err.response?.data?.message || 'Error deactivating user');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminCounts'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  const checkMobileExists = async (mobile) => {
    try {
      const response = await api.get(`/admin/user/check-mobile/${mobile}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking mobile number:', error);
      return false;
    }
  };

  return {
    createUser,
    updateUser,
    activateUser,
    deactivateUser,
    checkMobileExists,
    isCreating: createUser.isLoading,
    isUpdating: updateUser.isLoading,
    isActivating: activateUser.isLoading,
    isDeactivating: deactivateUser.isLoading,
  };
};
