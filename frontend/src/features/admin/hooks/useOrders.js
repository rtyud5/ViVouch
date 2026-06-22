import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getOrders, getOrderById } from '../api/adminApi';

export function useOrders(params) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => getOrders(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrderById(id) {
  return useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
}
