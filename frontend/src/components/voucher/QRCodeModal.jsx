import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CopyButton } from '../common';

/**
 * QRCodeModal displays a modal backdrop containing the voucher name,
 * a large scannable QR code generated from the coupon code, and a copy button.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback when closing the modal
 * @param {Object} props.voucherCode - The voucher code data object to display
 */
export function QRCodeModal({ isOpen, onClose, voucherCode }) {
  // Listen for Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { code, voucher = {} } = voucherCode || {};

  return (
    <div
      className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div
        className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center transform transition-transform duration-300 animate-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          className="self-end text-on-surface-variant hover:text-on-surface active:scale-95 transition-all p-1 rounded-full hover:bg-surface-container cursor-pointer"
          onClick={onClose}
          aria-label="Đóng"
        >
          <span className="material-symbols-outlined select-none">close</span>
        </button>

        {/* Voucher Title */}
        <h2 id="qr-modal-title" className="font-headline-md text-headline-md text-on-surface text-center mb-6 line-clamp-2 select-text font-semibold px-2">
          {voucher.name || 'Tên Voucher'}
        </h2>

        {/* QR Code Inner Box */}
        <div className="bg-surface-container p-4 rounded-xl mb-6 shadow-inner w-48 h-48 flex items-center justify-center border border-outline-variant/15 select-none">
          {code ? (
            <QRCodeSVG
              value={code}
              size={160}
              level="M"
              className="rounded bg-white p-1"
            />
          ) : (
            <span className="material-symbols-outlined text-[120px] text-on-surface font-light">qr_code_2</span>
          )}
        </div>

        {/* Voucher Code Text Box */}
        <p className="font-body-md text-body-md text-on-surface-variant mb-2 select-none">Mã của bạn</p>
        <div className="bg-primary-container/10 px-4 py-3 rounded-lg border border-primary/20 w-full flex items-center justify-center gap-3">
          <span className="font-mono text-[22px] font-bold text-primary tracking-[0.15em] select-all truncate">
            {code || 'MÃ VOUCHER'}
          </span>
          <CopyButton value={code} className="shrink-0 text-primary" showLabel={false} />
        </div>

        <button
          className="w-full mt-8 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-surface-tint active:scale-95 transition-all shadow-md hover:shadow-lg cursor-pointer"
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
