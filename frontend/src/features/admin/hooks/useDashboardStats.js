import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/adminApi';

/**
 * Hook to fetch admin dashboard KPI stats.
 * Uses TanStack Query with 60s stale time (matches useVouchers pattern).
 *
 * @returns {{ stats: object|null, isLoading: boolean, isError: boolean }}
 */
export const useDashboardStats = () => {
  const query = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 60_000, // 1 phút
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    ...query,
  };
};
