import React from 'react';
import PropTypes from 'prop-types';

/**
 * AdminStatusBadge component specifically for the Admin Portal.
 * Uses consistent color mapping according to the design system.
 * 
 * @param {Object} props
 * @param {string} props.status - The status key to display
 */
export const AdminStatusBadge = ({ status }) => {
  const config = {
    // Partner statuses
    ACTIVE:            { label: 'Hoạt động',      bg: '#dcfce7', text: '#166534' },
    APPROVED:          { label: 'Đã duyệt',       bg: '#dcfce7', text: '#166534' },
    SUSPENDED:         { label: 'Tạm khóa',        bg: '#fee2e2', text: '#991b1b' },
    PENDING_APPROVAL:  { label: 'Chờ duyệt',       bg: '#fef9c3', text: '#854d0e' },
    
    // Voucher statuses
    ON_SALE:           { label: 'Đang bán',         bg: '#dcfce7', text: '#166534' },
    DRAFT:             { label: 'Nháp',             bg: '#f1efea', text: '#534434' },
    REJECTED:          { label: 'Từ chối',          bg: '#fee2e2', text: '#991b1b' },
    EXPIRED:           { label: 'Hết hạn',          bg: '#f1efea', text: '#534434' },
    PAUSED:            { label: 'Tạm dừng',         bg: '#fef9c3', text: '#854d0e' },
    
    // Order / UserVoucher statuses
    ISSUED:            { label: 'Đã phát',          bg: '#dbeafe', text: '#1e40af' },
    USED:              { label: 'Đã dùng',           bg: '#dcfce7', text: '#166534' },
    CANCELLED:         { label: 'Đã hủy',           bg: '#fee2e2', text: '#991b1b' },
    LOCKED:            { label: 'Bị khóa',          bg: '#fee2e2', text: '#991b1b' },
    
    // User roles/statuses
    CUSTOMER:          { label: 'Khách hàng',       bg: '#dbeafe', text: '#1e40af' },
    PARTNER:           { label: 'Đối tác',          bg: '#ede9fe', text: '#5b21b6' },
    ADMIN:             { label: 'Admin',            bg: '#fef9c3', text: '#854d0e' },
  };

  const current = config[status] || { label: status, bg: '#f1efea', text: '#534434' };

  return (
    <span 
      className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ backgroundColor: current.bg, color: current.text }}
    >
      {current.label}
    </span>
  );
};

AdminStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};
