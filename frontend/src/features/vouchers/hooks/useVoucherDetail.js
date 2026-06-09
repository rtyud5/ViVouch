import { getVoucherById } from '../api/vouchers.api';
import { useQuery } from '@tanstack/react-query';
// Hook lấy chi tiết voucher
export const useVoucherDetail = (id) => {
  const query = useQuery({
    queryKey: ['voucher', id],
    queryFn: () => getVoucherById(id),
    enabled: !!id, // Chỉ chạy khi có id hợp lệ
  });

  return query;
};