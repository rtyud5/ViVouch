import React from 'react';

const CONFIG = {
  COMPLETED: {
    text: 'Thành công',
    className: 'bg-primary-container text-on-primary-container border-primary-container/20'
  },
  PENDING_PAYMENT: {
    text: 'Chờ thanh toán',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed/20'
  },
  PENDING: {
    text: 'Chờ xử lý',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed/20'
  },
  CANCELLED: {
    text: 'Đã hủy',
    className: 'bg-error-container text-on-error-container border-error-container/20'
  }
};

/**
 * OrderStatusBadge renders order statuses using standard brand colors and labels.
 *
 * @param {Object} props
 * @param {string} props.status - Order status (e.g. 'COMPLETED', 'PENDING_PAYMENT', 'CANCELLED', 'PENDING')
 * @returns {React.ReactElement}
 */
export function OrderStatusBadge({ status }) {
  const current = CONFIG[status] || {
    text: status || 'Chưa rõ',
    className: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30'
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full font-label-md text-xs font-semibold border uppercase tracking-wider ${current.className}`}
    >
      {current.text}
    </span>
  );
}
