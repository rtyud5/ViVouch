import React from 'react';
import PropTypes from 'prop-types';

/**
 * ConfirmModal component for critical actions across the application.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.message - Descriptive message
 * @param {string} props.confirmLabel - Text for the confirm button
 * @param {string} props.confirmVariant - 'danger' | 'warning' | 'primary'
 * @param {Function} props.onConfirm - Callback when confirmed
 * @param {Function} props.onCancel - Callback when cancelled
 * @param {boolean} props.loading - Whether a confirming action is in progress
 */
export const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = "Xác nhận", 
  confirmVariant = 'primary', 
  onConfirm, 
  onCancel, 
  loading = false 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-[#ba1a1a] text-white hover:bg-[#93000a]';
      case 'warning':
        return 'bg-amber-500 text-white hover:bg-amber-600';
      case 'primary':
      default:
        return 'bg-[#00694c] text-white hover:bg-[#004d38]';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 cursor-default"
      onClick={handleOverlayClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !loading) {
          onCancel();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Close modal overlay"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-[18px] font-semibold text-[#0b1c30] mb-2">{title}</h3>
        <p className="text-[14px] text-[#534434] mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-[#d8c3ad] text-[#534434] hover:bg-[#f1efea] text-[14px] font-medium transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50 ${getVariantStyles()}`}
          >
            {loading ? (
              <div className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></div>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  confirmVariant: PropTypes.oneOf(['danger', 'warning', 'primary']),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
