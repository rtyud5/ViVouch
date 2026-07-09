import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CopyButton } from './CopyButton';
import { formatDate } from '../../utils/formatDate';

/**
 * QRCodeModal component shows a popup with a scannable QR code generated client-side and voucher code string.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Object} props.voucherCode - Voucher code object
 * @returns {React.ReactElement}
 */
export function QRCodeModal({ isOpen, onClose, voucherCode }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !voucherCode) return null;

  const { code, expiresAt, expirationDate, voucher } = voucherCode;
  const voucherTitle = voucher?.title || voucher?.name || 'Voucher';
  const displayExpiry = expiresAt || expirationDate;

  return (
    <div
      className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 animate-fade-in focus:outline-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            onClose();
          }
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết mã QR Voucher"
      tabIndex={0}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center transform transition-transform duration-300 scale-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
          onClick={onClose}
          aria-label="Đóng"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="font-headline-md text-headline-md text-on-surface text-center mb-6 mt-4 px-4 line-clamp-2 leading-tight">
          {voucherTitle}
        </h2>

        {/* QR Code Container */}
        <div className="bg-surface-container p-4 rounded-xl mb-6 shadow-inner w-48 h-48 flex items-center justify-center border border-outline-variant">
          <QRCodeSVG
            value={code || ''}
            size={160}
            level="H"
            marginSize={0}
            className="w-full h-full object-contain rounded-lg shadow-sm"
          />
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant mb-2">Mã của bạn</p>
        <div className="bg-primary-container/10 px-4 py-3 rounded-lg border border-primary/20 w-full flex items-center justify-between gap-3">
          <p className="font-mono text-[20px] font-bold text-primary tracking-[0.15em] select-all truncate pl-2">
            {code}
          </p>
          <CopyButton text={code} className="shrink-0 mr-1" />
        </div>

        {displayExpiry && (
          <p className="text-on-surface-variant font-label-md text-label-md flex items-center mt-4 text-[13px]">
            <span className="material-symbols-outlined mr-2 text-primary text-[16px]">event</span>
            Hạn dùng: {formatDate(displayExpiry)}
          </p>
        )}

        <button
          className="w-full mt-6 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-surface-tint active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
