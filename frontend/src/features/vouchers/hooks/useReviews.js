import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVoucherReviews, createVoucherReview, getVoucherReviewEligibility } from "../api/vouchers.api";

// Lấy danh sách đánh giá
export function useReviews(voucherId, options = {}) {
  const idStr = voucherId != null ? String(voucherId) : undefined;
  return useQuery({
    queryKey: ["reviews", idStr],
    queryFn: () => getVoucherReviews(voucherId),
    enabled: !!voucherId,
    ...options,
  });
}

export function useReviewEligibility(voucherId, options = {}) {
  const idStr = voucherId != null ? String(voucherId) : undefined;
  return useQuery({
    queryKey: ["reviewEligibility", idStr],
    queryFn: () => getVoucherReviewEligibility(voucherId),
    enabled: Boolean(voucherId),
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
      queryClient.invalidateQueries({ queryKey: ["reviewEligibility", voucherIdStr] });
    },
  });
}
