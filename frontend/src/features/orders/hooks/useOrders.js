import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../api/orders.api";
import { useAuthStore } from "../../../stores/authStore";

export function useOrders(options = {}) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: !!accessToken,
    ...options,
  });

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    ...query,
  };
}
