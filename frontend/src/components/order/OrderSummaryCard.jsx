import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * OrderSummaryCard renders a structured order receipt summary,
 * useful for checkout pages or order detailed logs.
 *
 * @param {Object} props
 * @param {number} props.totalQuantity - Total quantity of vouchers
 * @param {number} props.totalAmount - Base subtotal price
 * @param {number} [props.discount=0] - Discount amount applied
 * @param {number} props.finalAmount - Final payable amount
 * @param {string} [props.paymentMethod] - Simulated payment method text
 * @param {React.ReactNode} [props.actionButton] - CTA payment/navigation button slot
 * @param {string} [props.title='Tóm tắt'] - Custom title heading
 * @param {string} [props.className=''] - Additional CSS classes
 */
export function OrderSummaryCard({
  totalQuantity,
  totalAmount,
  discount = 0,
  finalAmount,
  paymentMethod,
  actionButton,
  title = 'Tóm tắt',
  className = ''
}) {
  return (
    <section className={`bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-sm ${className}`}>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-4 border-b border-surface-variant pb-2 font-semibold">
        {title}
      </h2>
      
      <div className="flex flex-col gap-3 select-none">
        {/* Total Quantity */}
        <div className="flex justify-between items-center text-sm">
          <span className="font-body-md text-on-surface-variant">Tổng số lượng:</span>
          <span className="font-body-md text-on-surface font-medium">{totalQuantity} voucher</span>
        </div>
        
        {/* Base Subtotal */}
        <div className="flex justify-between items-center text-sm">
          <span className="font-body-md text-on-surface-variant">Tổng tiền:</span>
          <span className="font-body-md text-on-surface font-medium">{formatCurrency(totalAmount)}</span>
        </div>
        
        {/* Discount Line */}
        {discount > 0 && (
          <div className="flex justify-between items-center text-sm text-secondary">
            <span className="font-body-md font-medium">Giảm giá:</span>
            <span className="font-body-md font-medium">-{formatCurrency(discount)}</span>
          </div>
        )}
        
        {/* Payment Method */}
        {paymentMethod && (
          <div className="flex justify-between items-center text-sm border-t border-surface-variant/40 pt-3 mt-1">
            <span className="font-body-md text-on-surface-variant">Phương thức:</span>
            <span className="font-body-md text-on-surface font-medium truncate max-w-[60%]">{paymentMethod}</span>
          </div>
        )}
        
        {/* Final Amount */}
        <div className="border-t border-surface-variant pt-3 mt-1 flex justify-between items-center">
          <span className="font-label-md text-label-md text-on-surface font-semibold">Thành tiền:</span>
          <span className="font-price-display text-price-display text-primary select-all">
            {formatCurrency(finalAmount)}
          </span>
        </div>
      </div>
      
      {/* Action Button Slot */}
      {actionButton && (
        <div className="mt-6">
          {actionButton}
        </div>
      )}
    </section>
  );
}
