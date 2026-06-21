import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../features/cart/hooks/useCart";
import { useCheckout } from "../../features/orders/hooks";
import { ApiErrorToast } from "../../components/common/ApiErrorToast";
import { CustomerEmptyState } from "../../components/common/CustomerEmptyState";
import { OrderSummaryCard } from "../../components/voucher/OrderSummaryCard";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, isLoading: isCartLoading } = useCart();
  const checkoutMutation = useCheckout();
  const [localError, setLocalError] = React.useState(null);

  const cartItems = cart?.items ?? [];
  const items = React.useMemo(
    () =>
      cartItems.map((item) => ({
        id: item.voucherId ?? item.id,
        qty: item.qty,
      })),
    [cartItems]
  );

  const totalQty = cartTotal?.totalQty ?? items.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount =
    cartTotal?.totalAmount ??
    cartItems.reduce((sum, item) => {
      const price = Number(item.voucher?.salePrice) || 0;
      return sum + price * item.qty;
    }, 0);

  const handleCheckout = async () => {
    try {
      setLocalError(null);
      const result = await checkoutMutation.mutateAsync({
        items,
        paymentMethod: "MOCK_GATEWAY",
      });

      if (!result?.orderId) {
        setLocalError(new Error("Thiếu mã đơn hàng trong phản hồi thanh toán."));
        return;
      }

      const successPayload = {
        orderId: result.orderId,
        voucherCodes: result.voucherCodes ?? [],
      };

      sessionStorage.setItem("vivouch:last-order-success", JSON.stringify(successPayload));

      navigate("/customer/order-success", {
        state: successPayload,
      });
    } catch (error) {
      setLocalError(error);
    }
  };

  if (isCartLoading && !cart) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isCartLoading && totalQty === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <CustomerEmptyState
          type="cart"
          title="Chưa có gì để thanh toán"
          description="Giỏ hàng của bạn đang trống. Hãy chọn voucher trước khi quay lại bước thanh toán."
          action={
            <Link to="/vouchers" className="btn btn-primary rounded-full px-8 font-bold">
              Khám phá voucher ngay
            </Link>
          }
        />
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
