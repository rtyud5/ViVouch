import { getVouchers } from "../api/vouchers.api";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

// Hook lấy danh sách vouchers (Cache 60s, tự động refetch khi params đổi)
export const useVouchers = (params, options = {}) => {
  const query = useQuery({
    queryKey: ["vouchers", params],
    queryFn: () => getVouchers(params),
    staleTime: 60 * 1000, // 60 giây
    placeholderData: keepPreviousData,
    ...options,
  });

  return {
    vouchers: query.data?.data || [],
    pagination: query.data?.pagination || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
