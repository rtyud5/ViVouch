import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../features/cart/hooks/useCart";
import { useCheckout } from "../../features/orders/hooks";
import { ApiErrorToast } from "../../components/common/ApiErrorToast";
import { formatCurrency } from "../../utils/formatCurrency";

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
      await checkoutMutation.mutateAsync({ items, paymentMethod: "MOCK_GATEWAY" });
      navigate("/customer/orders");
    } catch (error) {
      setLocalError(error);
      throw error;
    }
  };

  if (isCartLoading && !cart) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ApiErrorToast
        error={checkoutMutation.error || localError}
        message="Thanh toán thất bại. Vui lòng thử lại."
      />

      <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body gap-4">
          <div className="flex justify-between">
            <span>Tổng số lượng</span>
            <strong>{totalQty}</strong>
          </div>
          <div className="flex justify-between">
            <span>Tổng tiền</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCheckout}
            disabled={checkoutMutation.isPending || totalQty === 0}
          >
            {checkoutMutation.isPending ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}
