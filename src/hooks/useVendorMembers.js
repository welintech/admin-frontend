import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useVendorMembers = (vendorId) => {
  return useQuery({
    queryKey: ['vendor-members', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const response = await api.get(`/member/vendor/${vendorId}`);
      return response.data.data;
    },
    enabled: !!vendorId,
  });
};

export const useVendorsMembers = (vendorIds) => {
  return useQuery({
    queryKey: ['vendors-members', vendorIds],
    queryFn: async () => {
      if (!vendorIds?.length) return {};
      const results = await Promise.all(
        vendorIds.map(async (id) => {
          try {
            const response = await api.get(`/member/vendor/${id}`);
            return { id, data: response.data.data };
          } catch (error) {
            console.error(`Error fetching members for vendor ${id}:`, error);
            return { id, data: [] };
          }
        })
      );
      return results.reduce((acc, { id, data }) => {
        acc[id] = data;
        return acc;
      }, {});
    },
    enabled: !!vendorIds?.length,
  });
};
