import React, { useState, useEffect } from "react";
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

  // Sử dụng state nội bộ để cho phép người dùng gõ trống "" hoặc số tùy ý
  // mà không bắt buộc prop value phải nhận kiểu string.
  const [localVal, setLocalVal] = useState(String(value || 1));

  // Đồng bộ localVal khi value thay đổi từ bên ngoài (ví dụ qua click button hoặc prop update)
  useEffect(() => {
    setLocalVal(String(value || 1));
  }, [value]);

  const isMinusDisabled = disabled || isOutOfStock || (Number(value) || 1) <= 1;
  const isPlusDisabled = disabled || isOutOfStock || (Number(value) || 1) >= max;

  const handleDecrease = () => {
    // Ép kiểu số an toàn trước khi tính toán để tránh bug nối chuỗi
    const currentNum = parseInt(String(value), 10) || 1;
    if (currentNum > 1) {
      onChange(currentNum - 1);
    }
  };

  const handleIncrease = () => {
    // Ép kiểu số an toàn trước khi tính toán để tránh bug nối chuỗi
    const currentNum = parseInt(String(value), 10) || 1;
    if (currentNum < max) {
      onChange(currentNum + 1);
    }
  };

  const handleInputChange = (e) => {
    if (disabled || isOutOfStock) return;
    
    const valStr = e.target.value;
    // Chỉ cho phép nhập số
    const cleanVal = valStr.replace(/[^0-9]/g, "");
    
    setLocalVal(cleanVal); // Cập nhật local state để hiển thị đúng những gì người dùng đang gõ
    
    // Nếu trống thì tạm thời không emit onChange lên parent để tránh truyền chuỗi rỗng ""
    if (cleanVal === "") {
      return;
    }

    let val = parseInt(cleanVal, 10);
    if (isNaN(val) || val < 1) {
      val = 1;
    } else if (val > max) {
      val = max;
    }
    
    // Luôn luôn emit kiểu số nguyên (number)
    onChange(val);
  };

  const handleBlur = () => {
    // Khi người dùng click ra ngoài, nếu ô input đang trống hoặc không hợp lệ thì reset về 1
    const val = parseInt(localVal, 10);
    if (isNaN(val) || val < 1) {
      setLocalVal("1");
      onChange(1);
    } else if (val > max) {
      setLocalVal(String(max));
      onChange(max);
    } else {
      setLocalVal(String(val));
      onChange(val);
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
          value={localVal}
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
