import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, AlertCircle } from "lucide-react";
import { QtySelector } from "../../../components/voucher/QtySelector";
import { formatCurrency } from "../../../utils/formatCurrency";

export function CartItem({ item, onUpdateQty, onRemove, isPending }) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { id: itemId, qty, voucher } = item;
  if (!voucher) return null;

  const title = voucher.title || voucher.name || "Voucher";
  const partnerName = voucher.partner?.businessName || voucher.partnerName || "";
  const remaining = voucher.remainingQty ?? Math.max(0, (voucher.totalQty ?? 0) - (voucher.soldQuantity ?? voucher.soldQty ?? 0));
  const salePrice = Number(voucher.salePrice) || 0;
  const originalPrice = Number(voucher.originalPrice) || 0;
  
  const totalItemPrice = salePrice * qty;
  const isLowStock = remaining > 0 && remaining < 5;
  const isOutOfStock = remaining <= 0;

  const handleQtyChange = async (newQty) => {
    if (newQty === qty) return;
    setIsUpdating(true);
    try {
      await onUpdateQty(itemId, newQty);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemove(itemId);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm transition-opacity ${(isUpdating || isPending) ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Hình ảnh */}
      <Link to={`/vouchers/${voucher.id}`} className="shrink-0">
        <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden bg-base-200 relative">
          {voucher.imageUrl ? (
            <img src={voucher.imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base-content/30 text-xs">No image</div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-base-100/70 flex items-center justify-center">
              <span className="badge badge-error badge-sm font-bold shadow-sm">Hết hàng</span>
            </div>
          )}
        </div>
      </Link>

      {/* Thông tin */}
      <div className="flex flex-col flex-grow justify-between gap-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
              {partnerName}
            </div>
            <Link to={`/vouchers/${voucher.id}`} className="font-semibold text-base-content hover:text-primary transition-colors line-clamp-2 leading-snug">
              {title}
            </Link>
            
            {/* Cảnh báo sắp hết */}
            {isLowStock && (
              <div className="flex items-center gap-1 text-warning mt-1 text-xs font-medium">
                <AlertCircle size={14} />
                <span>Sắp hết (Còn lại {remaining})</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleRemove}
            disabled={isUpdating || isPending}
            className="btn btn-ghost btn-sm btn-circle text-base-content/40 hover:text-error hover:bg-error/10 shrink-0"
            title="Xoá khỏi giỏ hàng"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-4 mt-auto border-t border-base-200 pt-3 sm:border-0 sm:pt-0">
          {/* Đơn giá */}
          <div>
            <div className="text-primary font-bold">
              {salePrice > 0 ? formatCurrency(salePrice) : "Miễn phí"}
            </div>
            {originalPrice > salePrice && (
              <div className="text-xs text-base-content/40 line-through">
                {formatCurrency(originalPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            {/* Qty Selector */}
            <div className="w-32">
              <QtySelector 
                value={qty} 
                onChange={handleQtyChange} 
                max={remaining} 
                disabled={isUpdating || isOutOfStock || isPending} 
              />
            </div>
            
            {/* Tổng tiền của item */}
            <div className="text-right hidden sm:block min-w-[100px]">
              <div className="text-xs text-base-content/50 mb-0.5">Thành tiền</div>
              <div className="font-bold text-base-content text-lg">
                {totalItemPrice > 0 ? formatCurrency(totalItemPrice) : "0đ"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
