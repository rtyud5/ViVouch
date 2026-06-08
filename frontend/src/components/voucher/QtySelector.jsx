import React from "react";
import { Minus, Plus } from "lucide-react";

/**
 * QtySelector component
 *
 * Component cho phép chọn số lượng mua voucher.
 *
 * Props:
 * @param {number} value - Số lượng hiện tại
 * @param {function} onChange - Hàm callback khi thay đổi số lượng: (newValue) => void
 * @param {number} max - Số lượng tối đa có thể mua (remainingQuantity)
 * @param {boolean} disabled - Trạng thái vô hiệu hóa toàn bộ selector (ví dụ khi hết hàng)
 */
export function QtySelector({ value, onChange, max = 1, disabled = false }) {
  const isOutOfStock = max <= 0;
  const isMinusDisabled = disabled || isOutOfStock || value <= 1;
  const isPlusDisabled = disabled || isOutOfStock || value >= max;

  const handleDecrease = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e) => {
    if (disabled || isOutOfStock) return;
    
    const valStr = e.target.value;
    // Chỉ cho phép nhập số
    const cleanVal = valStr.replace(/[^0-9]/g, "");
    
    if (cleanVal === "") {
      onChange(""); // Cho phép tạm thời trống để người dùng nhập số mới
      return;
    }

    let val = parseInt(cleanVal, 10);
    if (isNaN(val) || val < 1) {
      val = 1;
    } else if (val > max) {
      val = max;
    }
    onChange(val);
  };

  const handleBlur = () => {
    // Khi người dùng click ra ngoài, nếu ô input đang trống hoặc không hợp lệ thì reset về 1
    if (value === "" || isNaN(value)) {
      onChange(1);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
        Số lượng
      </span>
      <div className="join border border-base-300 bg-base-100 rounded-lg max-w-[140px] flex items-center justify-between shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={isMinusDisabled}
          className="btn btn-ghost btn-sm join-item px-2.5 h-10 min-h-10 text-base-content/70 hover:bg-base-200 transition-colors"
          title="Giảm số lượng"
        >
          <Minus size={16} />
        </button>
        
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled || isOutOfStock}
          className="w-12 h-10 min-h-10 text-center join-item bg-transparent border-0 outline-none focus:ring-0 font-semibold text-sm"
        />

        <button
          type="button"
          onClick={handleIncrease}
          disabled={isPlusDisabled}
          className="btn btn-ghost btn-sm join-item px-2.5 h-10 min-h-10 text-base-content/70 hover:bg-base-200 transition-colors"
          title="Tăng số lượng"
        >
          <Plus size={16} />
        </button>
      </div>
      
      {/* Hiển thị giới hạn còn lại */}
      {max > 0 ? (
        <span className="text-xs text-base-content/50 mt-1">
          Còn lại {max} sản phẩm
        </span>
      ) : (
        <span className="text-xs text-error mt-1 font-medium">
          Hết hàng
        </span>
      )}
    </div>
  );
}
