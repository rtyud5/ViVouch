import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * OrderItemCard component displays details for an individual item inside an order.
 *
 * @param {Object} props
 * @param {Object} props.item - The order item object
 * @param {Object} props.item.voucher - The related voucher object
 * @param {string} [props.item.voucher.title] - Voucher title (DB schema)
 * @param {string} [props.item.voucher.name] - Voucher name (legacy)
 * @param {string} [props.item.voucher.imageUrl] - Voucher image URL (DB schema)
 * @param {string} [props.item.voucher.image] - Voucher image URL (legacy)
 * @param {number} [props.item.qty] - Quantity (checkout payload)
 * @param {number} [props.item.quantity] - Quantity (DB schema)
 * @param {number|string} [props.item.unitPrice] - Unit price of the voucher
 * @returns {React.ReactElement}
 */
export function OrderItemCard({ item = {} }) {
  const { voucher, qty, quantity, unitPrice } = item;

  const voucherTitle = voucher?.title || voucher?.name || 'Voucher';
  const voucherImage = voucher?.imageUrl || voucher?.image || 'https://placehold.co/100x100';
  const displayQty = quantity ?? qty ?? 1;

  return (
    <div className="flex gap-4 items-center p-3 bg-surface rounded-xl border border-outline-variant/20 hover:border-outline-variant/40 transition-colors duration-200 w-full">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 shadow-sm border border-outline-variant/30 bg-surface-container-high">
        <img
          src={voucherImage}
          alt={voucherTitle}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
        <div>
          <h4 className="font-label-md text-label-md text-on-surface line-clamp-2 leading-snug">
            {voucherTitle}
          </h4>
          <p className="font-body-md text-[13px] text-on-surface-variant mt-1">
            Số lượng: <span className="font-semibold text-on-surface">{displayQty}</span>
          </p>
        </div>
        {unitPrice !== undefined && unitPrice !== null && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[12px] text-on-surface-variant">Đơn giá:</span>
            <span className="font-price-display text-[14px] text-primary">
              {formatCurrency(Number(unitPrice))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
