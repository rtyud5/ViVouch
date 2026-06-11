import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCart, addCartItem, updateCartItem, removeCartItem } from "../api/Cart.api";

const CART_KEY = ["cart"];

export function useCart(options = {}) {
  const queryClient = useQueryClient();

  // Query 
  const { data: cart, isLoading, error} = useQuery({
    ...options,
    queryKey: CART_KEY,
    queryFn: getCart,
  });

  // cartTotal từ backend
  const cartTotal = cart?.cartTotal ?? null;

  // cartCount = tổng qty (dùng cho badge navbar)
  const cartCount = cart?.cartTotal?.totalQty ?? 0;

  // Shared invalidate helper 
  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: CART_KEY });

  // Mutations
  const addMutation = useMutation({
    mutationFn: addCartItem,
    onSuccess: invalidateCart,
  });

  const updateMutation = useMutation({
    mutationFn: updateCartItem,
    onSuccess: invalidateCart,
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: invalidateCart,
  });

  // Public API
  const addToCart = (payload, options) =>
    addMutation.mutateAsync(payload, options);

  const updateQty = (payload, options) =>
    updateMutation.mutateAsync(payload, options);

  const removeItem = (itemId, options) =>
    removeMutation.mutateAsync(itemId, options);

  return {
    cart,
    cartCount,
    cartTotal,  // { totalUniqueItems, totalAmount, totalOriginalAmount, totalSavings }
    isLoading,
    error,
    addToCart,
    updateQty,
    removeItem,
  };
}
