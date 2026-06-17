import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../api/adminApi';

export const usePartners = (params) => {
  return useQuery({
    queryKey: ['adminPartners', params],
    queryFn: () => adminApi.getPartners(params),
    keepPreviousData: true,
  });
};

export const useApprovePartner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (partnerId) => adminApi.approvePartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPartners'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
};

export const useRejectPartner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ partnerId, reason }) => adminApi.rejectPartner(partnerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPartners'] });
    },
  });
};
