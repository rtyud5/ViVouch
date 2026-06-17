import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../api/orders.api";

export function useOrders(options = {}) {
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    ...options,
  });

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    ...query,
  };
}
