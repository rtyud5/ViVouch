import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkout } from "../api/orders.api";

export async function invalidateCheckoutQueries(queryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["cart"] }),
    queryClient.invalidateQueries({ queryKey: ["orders"] }),
    queryClient.invalidateQueries({ queryKey: ["voucher-codes"] }),
  ]);
}

export function useCheckout(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ items, paymentMethod, recipientName, recipientPhone, note }) => 
      checkout(items, paymentMethod, recipientName, recipientPhone, note),
    onSuccess: async (...args) => {
      await invalidateCheckoutQueries(queryClient);

      return onSuccess?.(...args);
    },
    ...mutationOptions,
  });
}
