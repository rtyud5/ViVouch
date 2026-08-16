import { getVoucherById } from '../api/vouchers.api';
import { useQuery } from '@tanstack/react-query';
// Hook lấy chi tiết voucher
export const useVoucherDetail = (id) => {
  const query = useQuery({
    queryKey: ['voucher', id],
    queryFn: () => getVoucherById(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404 || error?.response?.status === 400) return false;
      return failureCount < 2;
    }
  });

  return query;
};