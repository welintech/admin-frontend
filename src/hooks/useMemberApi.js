import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export const useMembers = (vendorId) => {
  return useQuery({
    queryKey: ['members', vendorId],
    queryFn: async () => {
      const { data } = await api.get(`/member/vendor/${vendorId}`);
      return data.data;
    },
    enabled: !!vendorId,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData) => {
      try {
        const { data } = await api.post('/member', memberData);
        return data;
      } catch (error) {
        console.error('Error creating member:', error.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['members']);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, memberData }) => {
      const { data } = await api.put(`/member/${memberId}`, memberData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['members']);
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId) => {
      const { data } = await api.delete(`/member/${memberId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['members']);
    },
  });
};
