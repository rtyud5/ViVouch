import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "../../features/cart/hooks/useCart";
import { CartItem } from "../../features/cart/components/CartItem";
import { formatCurrency } from "../../utils/formatCurrency";
import { ApiErrorToast } from "../../components/common/ApiErrorToast";

export function CartPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, isLoading, error, updateQty, removeItem } = useCart();

  const handleUpdateQty = async (itemId, newQty) => {
    await updateQty({ itemId, qty: newQty });
  };

  const handleRemove = async (itemId) => {
    await removeItem(itemId);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  // --- Loading Skeleton ---
  if (isLoading && !cart) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 w-48 bg-base-300 rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 w-full bg-base-300 rounded-2xl"></div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="h-64 w-full bg-base-300 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Lấy danh sách items, xử lý an toàn
  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  // Tổng số lượng và thành tiền
  // Ưu tiên lấy từ backend cartTotal, nếu không tự tính để phòng hờ
  const totalQty = cartTotal?.totalQty ?? items.reduce((acc, item) => acc + item.qty, 0);
  const totalAmount = cartTotal?.totalAmount ?? items.reduce((acc, item) => {
    const price = Number(item.voucher?.salePrice) || 0;
    return acc + price * item.qty;
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 bg-base-100 min-h-screen">
      <ApiErrorToast error={error} message="Lỗi khi tải giỏ hàng" />

      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-base-content tracking-tight">
          Giỏ hàng của bạn
        </h1>
        <Link to="/vouchers" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
          Tiếp tục mua sắm
        </Link>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-base-50 rounded-3xl border border-base-200 border-dashed text-center px-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
            <ShoppingCart size={40} />
          </div>
          <h2 className="text-xl font-bold text-base-content mb-2">Giỏ hàng trống</h2>
          <p className="text-base-content/60 max-w-sm mx-auto mb-8">
            Bạn chưa có voucher nào trong giỏ hàng. Hãy khám phá hàng ngàn ưu đãi hấp dẫn đang chờ bạn!
          </p>
          <Link to="/vouchers" className="btn btn-primary rounded-full px-8 font-bold">
            Khám phá voucher ngay
          </Link>
        </div>
      ) : (
        /* Có sản phẩm */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột Danh sách sản phẩm */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Header danh sách ẩn trên mobile */}
            <div className="hidden sm:flex justify-between items-center px-4 py-2 text-xs font-bold text-base-content/50 uppercase tracking-wider border-b border-base-200 pb-3">
              <div>Sản phẩm ({totalQty})</div>
            </div>

            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <CartItem 
                  key={item.id} 
                  item={item} 
                  onUpdateQty={handleUpdateQty} 
                  onRemove={handleRemove} 
                />
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-base-200">
              <Link to="/vouchers" className="btn btn-ghost btn-sm text-base-content/70 hover:text-primary gap-2 px-0 font-medium">
                <ArrowLeft size={16} /> Quay lại danh sách voucher
              </Link>
            </div>
          </div>

          {/* Cột Tổng kết (Order Summary) */}
          <div className="lg:col-span-4">
            <div className="card bg-base-50/50 border border-base-200 rounded-2xl shadow-sm sticky top-24">
              <div className="card-body p-6 gap-6">
                <h3 className="font-bold text-lg text-base-content border-b border-base-200 pb-4">
                  Tổng kết đơn hàng
                </h3>
                
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center text-base-content/70">
                    <span>Tổng số lượng</span>
                    <span className="font-semibold text-base-content">{totalQty} voucher</span>
                  </div>
                  <div className="flex justify-between items-center text-base-content/70">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-base-content">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <div className="divider my-0"></div>

                <div className="flex justify-between items-end">
                  <span className="font-bold text-base-content">Tổng tiền</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary block leading-none">
                      {formatCurrency(totalAmount)}
                    </span>
                    <span className="text-[10px] text-base-content/50 block mt-1">
                      (Đã bao gồm VAT)
                    </span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 text-base"
                  onClick={handleCheckout}
                >
                  Thanh toán ngay <ArrowRight size={18} />
                </button>

                <p className="text-xs text-center text-base-content/50 mt-2">
                  Bạn có thể áp dụng mã giảm giá ở bước thanh toán tiếp theo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
