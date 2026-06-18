import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../features/cart/hooks/useCart";
import { useCheckout } from "../../features/orders/hooks";
import { ApiErrorToast } from "../../components/common/ApiErrorToast";
import { OrderSummaryCard } from "../../components/voucher/OrderSummaryCard";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, isLoading: isCartLoading } = useCart();
  const checkoutMutation = useCheckout();
  const [localError, setLocalError] = React.useState(null);

  const items = React.useMemo(() => {
    return (cart?.items ?? []).map((item) => ({
      id: item.voucherId ?? item.id,
      qty: item.qty,
    }));
  }, [cart?.items]);

  const totalQty = cartTotal?.totalQty ?? items.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cartTotal?.totalAmount ?? 0;

  const handleCheckout = async () => {
    try {
      setLocalError(null);
      const result = await checkoutMutation.mutateAsync({ items, paymentMethod: "MOCK_GATEWAY" });
      navigate("/customer/order-success", {
        state: {
          orderId: result?.orderId,
          voucherCodes: result?.voucherCodes
        }
      });
    } catch (error) {
      setLocalError(error);
      throw error;
    }
  };

  if (isCartLoading && !cart) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ApiErrorToast
        error={checkoutMutation.error || localError}
        message="Thanh toán thất bại. Vui lòng thử lại."
      />

      <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

      <div className="max-w-md">
        <OrderSummaryCard
          totalQty={totalQty}
          totalAmount={totalAmount}
          paymentMethod="MOCK_GATEWAY"
          action={
            <button
              className="btn btn-primary w-full rounded-full mt-2 hover:bg-surface-tint active:scale-[0.98] transition-all shadow-sm"
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending || totalQty === 0}
            >
              {checkoutMutation.isPending ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </button>
          }
        />
      </div>
    </div>
  );
}
