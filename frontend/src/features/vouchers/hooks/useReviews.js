import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVoucherReviews, createVoucherReview } from "../api/vouchers.api";

// Lấy danh sách đánh giá
export function useReviews(voucherId, options = {}) {
  return useQuery({
    queryKey: ["reviews", voucherId],
    queryFn: () => getVoucherReviews(voucherId),
    enabled: !!voucherId,
    ...options,
  });
}

// Tạo đánh giá mới
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voucherId, data }) => createVoucherReview(voucherId, data),
    onSuccess: (data, variables) => {
      // Invalidate both reviews list and voucher detail to update average rating
      const voucherIdStr = String(variables.voucherId);
      queryClient.invalidateQueries({ queryKey: ["reviews", voucherIdStr] });
      queryClient.invalidateQueries({ queryKey: ["voucher", voucherIdStr] });
    },
  });
}
