import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as adminApi from '../api/adminApi';

export const useVoucherApprovals = (params) => {
  return useQuery({
    queryKey: ['adminVouchers', params],
    queryFn: () => adminApi.getVouchers(params),
    placeholderData: keepPreviousData,
  });
};

export const useApproveVoucher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (voucherId) => adminApi.approveVoucher(voucherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVouchers'] });
    },
  });
};

export const useRejectVoucher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ voucherId, reason }) => adminApi.rejectVoucher(voucherId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVouchers'] });
    },
  });
};
