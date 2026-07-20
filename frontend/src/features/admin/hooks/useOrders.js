import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getOrders, getOrderById, cancelOrder } from '../api/adminApi';

export function useOrders(params) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => getOrders(params),
    placeholderData: keepPreviousData,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => cancelOrder(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

export function useOrderById(id) {
  return useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
}
