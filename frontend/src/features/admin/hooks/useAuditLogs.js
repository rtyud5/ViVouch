import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getAuditLogs } from '../api/adminApi';

export function useAuditLogs(params) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => getAuditLogs(params),
    placeholderData: keepPreviousData,
  });
}
