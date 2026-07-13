import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../features/cart/hooks/useCart";
import { useCheckout } from "../../features/orders/hooks";
import { useAuthStore } from "../../stores/authStore";
import { ApiErrorToast } from "../../components/common/ApiErrorToast";
import { CustomerEmptyState } from "../../components/common/CustomerEmptyState";
import { ErrorRetryPanel } from "../../components/common";
import { formatCurrency } from "../../utils/formatCurrency";
import { createCheckoutIdempotencyKey } from "../../utils/idempotencyKey";

const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, isLoading: isCartLoading, error: cartError } = useCart();
  const checkoutMutation = useCheckout();
  const idempotencyKeyRef = React.useRef(null);
  const { user } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState("VIVOUCH_WALLET");
  const [localError, setLocalError] = useState(null);
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [note, setNote] = useState("");

  const cartItems = cart?.items || [];
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

      if (isGift) {
        if (!recipientName.trim()) {
          setLocalError(new Error("Vui lòng nhập tên người nhận quà."));
          return;
        }
        if (!recipientPhone.trim()) {
          setLocalError(new Error("Vui lòng nhập số điện thoại người nhận quà."));
          return;
        }
        if (!/^[0-9+]{9,15}$/.test(recipientPhone.trim())) {
          setLocalError(new Error("Số điện thoại người nhận không hợp lệ (yêu cầu từ 9 đến 15 chữ số)."));
          return;
        }
      }

      if (!idempotencyKeyRef.current) {
        try {
          idempotencyKeyRef.current = createCheckoutIdempotencyKey();
        } catch (keyErr) {
          setLocalError(keyErr);
          return;
        }
      }

      const result = await checkoutMutation.mutateAsync({
        items,
        paymentMethod,
        recipientName: isGift ? recipientName.trim() : null,
        recipientPhone: isGift ? recipientPhone.trim() : null,
        note: note.trim() || null,
        idempotencyKey: idempotencyKeyRef.current,
      });

      if (!result?.orderId) {
        setLocalError(new Error("Thiếu mã đơn hàng trong phản hồi thanh toán."));
        return;
      }

      const mappedVoucherCodes = (result.voucherCodes ?? []).map((code) => {
        const cartItem = cartItems.find((item) => (item.voucherId ?? item.id) === code.voucherId || item.voucher?.title === code.voucherTitle);
        return {
          ...code,
          imageUrl: code.imageUrl || cartItem?.voucher?.imageUrl || null,
        };
      });

      const successPayload = {
        orderId: result.orderId,
        voucherCodes: mappedVoucherCodes,
      };

      navigate("/customer/order-success", {
        state: successPayload,
        replace: true,
      });
    } catch (error) {
      setLocalError(error);
    }
  };

  if (isCartLoading && !cart) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 w-48 bg-base-300 rounded mb-8"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-base-200/50 rounded-2xl h-40"></div>
            <div className="bg-base-200/50 rounded-2xl h-64"></div>
            <div className="bg-base-200/50 rounded-2xl h-48"></div>
          </div>
          <div className="lg:w-96 w-full">
            <div className="bg-base-200/50 rounded-2xl h-72"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorRetryPanel 
          title="Không thể tải thông tin thanh toán" 
          description="Dữ liệu giỏ hàng tạm thời không truy cập được. Vui lòng thử lại." 
          onRetry={() => window.location.reload()} 
        />
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ApiErrorToast
        error={checkoutMutation.error || localError}
        message={localError?.message || "Thanh toán thất bại. Vui lòng thử lại."}
      />

      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content (Left) */}
        <div className="flex-1 space-y-6">
          {/* Buyer Info */}
          <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200">
            <h2 className="text-xl font-semibold mb-4">Thông tin người mua</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Họ và tên</span>
                <span className="font-medium text-right">{user?.fullName || user?.name || "Khách hàng"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Số điện thoại</span>
                <span className="font-medium text-right">{user?.phone || "Chưa cập nhật"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Email</span>
                <span className="font-medium text-right">{user?.email || "Chưa cập nhật"}</span>
              </div>
            </div>
          </div>

          {/* Gift Info & Notes */}
          <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200">
            <h2 className="text-xl font-semibold mb-4">Thông tin nhận quà & Ghi chú</h2>
            
            <div className="form-control mb-4">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary rounded-md"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                />
                <span className="label-text font-medium text-base-content">Mua làm quà tặng cho người khác</span>
              </label>
            </div>

            {isGift && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">Tên người nhận <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên người nhận"
                    className="input input-bordered w-full rounded-xl bg-base-100 text-base-content"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">Số điện thoại người nhận <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    className="input input-bordered w-full rounded-xl bg-base-100 text-base-content font-mono"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Ghi chú đơn hàng</span>
              </label>
              <textarea
                placeholder="Nhập ghi chú hoặc lời nhắn gửi kèm (không bắt buộc)..."
                className="textarea textarea-bordered w-full rounded-xl h-24 resize-none bg-base-100 text-base-content"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200 w-full overflow-hidden">
            <h2 className="text-xl font-semibold mb-4">Sản phẩm ({totalQty})</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pb-4 border-b border-base-200 last:border-0 last:pb-0">
                  <div className="flex gap-4 w-full sm:w-auto flex-1">
                    <div className="w-20 h-20 rounded-xl bg-base-200 overflow-hidden flex-shrink-0">
                      <img
                        src={item.voucher?.imageUrl || "/placeholder.jpg"}
                        alt={item.voucher?.title || item.voucher?.name || "Voucher"}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=Voucher"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-medium line-clamp-2 text-sm sm:text-base">{item.voucher?.title || item.voucher?.name}</h3>
                      <div className="text-xs sm:text-sm text-base-content/70 mt-1">
                        Đơn giá: {formatCurrency(item.voucher?.salePrice || 0)}
                      </div>
                      <div className="text-xs sm:text-sm text-base-content/70">Số lượng: {item.qty}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-primary sm:text-right w-full sm:w-auto text-sm sm:text-base mt-2 sm:mt-0">
                    Thành tiền: {formatCurrency(
                      (item.voucher?.salePrice || 0) * item.qty
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200">
            <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-base-200 rounded-xl cursor-pointer hover:bg-base-200/50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  className="radio radio-primary"
                  value="VIVOUCH_WALLET"
                  checked={paymentMethod === "VIVOUCH_WALLET"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="font-medium">Ví ViVouch</span>
                <span className="badge badge-warning badge-sm ml-auto">Thanh toán mô phỏng</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-base-200 rounded-xl cursor-pointer hover:bg-base-200/50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  className="radio radio-primary"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-base-200 rounded-xl cursor-pointer hover:bg-base-200/50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  className="radio radio-primary"
                  value="BANK_TRANSFER"
                  checked={paymentMethod === "BANK_TRANSFER"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="font-medium">Chuyển khoản</span>
                <span className="badge badge-warning badge-sm ml-auto">Thanh toán mô phỏng</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sticky Summary (Right) */}
        <div className="lg:w-96 w-full">
          <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200 lg:sticky top-24 w-full">
            <h2 className="text-xl font-semibold mb-6">Tóm tắt đơn hàng</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-base-content/80">
                <span>Tổng tiền hàng ({totalQty} sản phẩm)</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-base-content/80">
                <span>Phí giao dịch</span>
                <span>Miễn phí</span>
              </div>
            </div>

            <div className="border-t border-base-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary w-full rounded-full h-14 text-lg"
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending || totalQty === 0}
            >
              {checkoutMutation.isPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận & Thanh toán"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
