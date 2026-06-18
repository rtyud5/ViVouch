import React from 'react';

const STATUS_CONFIGS = {
  PENDING: {
    label: 'Chờ xử lý',
    classes: 'bg-warning/10 text-warning-content border border-warning/20'
  },
  COMPLETED: {
    label: 'Thành công',
    classes: 'bg-primary-container text-on-primary-container border border-primary-container/30'
  },
  PAID: {
    label: 'Đã thanh toán',
    classes: 'bg-primary-container text-on-primary-container border border-primary-container/30'
  },
  CANCELLED: {
    label: 'Đã huỷ',
    classes: 'bg-error-container text-on-error-container border border-error-container/30'
  },
  FAILED: {
    label: 'Thất bại',
    classes: 'bg-error-container text-on-error-container border border-error-container/30'
  }
};

/**
 * OrderStatusBadge renders a badge reflecting the status of a customer's order.
 *
 * @param {Object} props
 * @param {string} props.status - The status value (e.g. 'PENDING', 'COMPLETED', 'CANCELLED')
 * @param {string} [props.className=''] - Additional class names
 */
export function OrderStatusBadge({ status = '', className = '' }) {
  const normalizedStatus = (status || '').toUpperCase();
  const config = STATUS_CONFIGS[normalizedStatus] || {
    label: status || 'Không rõ',
    classes: 'bg-surface-variant text-on-surface-variant border border-outline-variant/30'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold select-none leading-none tracking-wide ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
}
