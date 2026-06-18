import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { OrderStatusBadge } from '../common/OrderStatusBadge';

/**
 * OrderSummaryCard component displays payment details, summary of amounts, and optional actions.
 *
 * @param {Object} props
 * @param {number} props.totalQty - Total quantity of vouchers ordered
 * @param {number|string} props.totalAmount - Total amount paid / to pay
 * @param {string} [props.paymentMethod] - Payment gateway or method
 * @param {string} [props.orderCode] - The code identifier for the order
 * @param {string} [props.date] - Date of purchase
 * @param {string} [props.status] - Status of the order
 * @param {React.ReactNode} [props.action] - CTA Button or action element
 * @returns {React.ReactElement}
 */
export function OrderSummaryCard({
  totalQty,
  totalAmount,
  paymentMethod,
  orderCode,
  date,
  status,
  action
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
        <h3 className="font-headline-md text-[18px] font-bold text-on-surface">
          Chi tiết thanh toán
        </h3>
        {status && <OrderStatusBadge status={status} />}
      </div>

      <div className="flex flex-col gap-3 font-body-md text-[14px] text-on-surface-variant">
        {orderCode && (
          <div className="flex justify-between items-center">
            <span>Mã đơn hàng</span>
            <span className="font-mono font-bold text-on-surface select-all">
              {orderCode}
            </span>
          </div>
        )}

        {date && (
          <div className="flex justify-between items-center">
            <span>Ngày giao dịch</span>
            <span className="text-on-surface font-medium">
              {formatDate(date)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>Tổng số lượng</span>
          <span className="text-on-surface font-semibold">{totalQty} voucher</span>
        </div>

        {paymentMethod && (
          <div className="flex justify-between items-center">
            <span>Phương thức thanh toán</span>
            <span className="text-on-surface font-medium capitalize">
              {paymentMethod.replace('_', ' ').toLowerCase()}
            </span>
          </div>
        )}

        <div className="border-t border-dashed border-outline-variant/30 my-1 pt-3 flex justify-between items-center">
          <span className="text-[16px] font-semibold text-on-surface">Tổng thanh toán</span>
          <span className="font-price-display text-[22px] text-primary">
            {formatCurrency(Number(totalAmount))}
          </span>
        </div>
      </div>

      {action && <div className="mt-2 w-full">{action}</div>}
    </div>
  );
}
