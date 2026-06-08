import React from "react";
import { ShoppingCart, Zap, Minus, Plus } from "lucide-react";

/**
 * StickyBuyBar component
 *
 * Thanh mua hàng cố định dưới đáy màn hình cho mobile.
 *
 * Props:
 * @param {object} voucher - Thông tin voucher
 * @param {number} quantity - Số lượng hiện tại
 * @param {function} onQuantityChange - Hàm cập nhật số lượng
 * @param {function} onAddToCart - Handler khi click Thêm giỏ hàng
 * @param {function} onBuyNow - Handler khi click Mua ngay
 * @param {boolean} disabled - Trạng thái vô hiệu hóa do hết hàng hoặc đang xử lý
 */
export function StickyBuyBar({
  voucher,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  disabled = false,
}) {
  if (!voucher) return null;

  const currentQty = parseInt(String(quantity), 10) || 1;
  const isOutOfStock = voucher.remainingQuantity <= 0;
  const isMinusDisabled = disabled || isOutOfStock || currentQty <= 1;
  const isPlusDisabled = disabled || isOutOfStock || currentQty >= voucher.remainingQuantity;

  const handleDecrease = () => {
    if (currentQty > 1) {
      onQuantityChange(currentQty - 1);
    }
  };

  const handleIncrease = () => {
    if (currentQty < voucher.remainingQuantity) {
      onQuantityChange(currentQty + 1);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-200 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] p-4 pb-safe transition-transform duration-300">
      <div className="flex flex-col gap-3">
        {/* Hàng 1: Tên voucher rút gọn & bộ tăng giảm số lượng mini */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-base-content/60 font-medium truncate max-w-[200px]">
              {voucher.name}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-primary font-bold text-base">
                {voucher.salePrice === 0 ? "Miễn phí" : `${voucher.salePrice.toLocaleString("vi-VN")}đ`}
              </span>
              {voucher.originalPrice > voucher.salePrice && (
                <span className="text-xs text-base-content/40 line-through">
                  {voucher.originalPrice.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>
          </div>

          {/* Qty Selector mini */}
          {!isOutOfStock && (
            <div className="flex items-center bg-base-200/80 rounded-lg p-0.5 border border-base-300">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={isMinusDisabled}
                className="w-7 h-7 flex items-center justify-center rounded text-base-content/70 hover:bg-base-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-xs font-bold text-base-content">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={isPlusDisabled}
                className="w-7 h-7 flex items-center justify-center rounded text-base-content/70 hover:bg-base-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Hàng 2: Các nút hành động */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={disabled || isOutOfStock}
            className="btn btn-outline btn-primary flex-1 btn-md h-11 min-h-11 font-bold rounded-xl flex items-center justify-center gap-1.5"
          >
            <ShoppingCart size={16} />
            <span>Thêm giỏ</span>
          </button>
          
          <button
            type="button"
            onClick={onBuyNow}
            disabled={disabled || isOutOfStock}
            className="btn btn-primary flex-[1.8] btn-md h-11 min-h-11 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/25"
          >
            <Zap size={16} />
            <span>{isOutOfStock ? "Hết hàng" : "Mua ngay"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
