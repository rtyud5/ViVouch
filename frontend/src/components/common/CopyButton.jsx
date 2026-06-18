import React, { useState } from 'react';

/**
 * CopyButton component provides a reusable button to copy text values to the clipboard.
 * It changes its icon and color to indicate successful copying.
 *
 * @param {Object} props
 * @param {string} props.value - The text to be copied
 * @param {string} [props.className=''] - Custom CSS classes
 * @param {boolean} [props.showLabel=false] - Show text label next to icon
 */
export function CopyButton({ value, className = '', showLabel = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation(); // Avoid triggering parent onClick (e.g. VoucherCodeCard)
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
        copied ? 'text-success' : 'text-primary hover:text-surface-tint'
      } ${className}`}
      title={copied ? "Đã sao chép!" : "Sao chép mã"}
      aria-label={copied ? "Đã sao chép" : "Sao chép mã"}
    >
      <span className="material-symbols-outlined text-[18px]">
        {copied ? 'check' : 'content_copy'}
      </span>
      {showLabel && (
        <span className="font-label-md text-xs font-semibold select-none">
          {copied ? 'Đã sao chép' : 'Sao chép'}
        </span>
      )}
    </button>
  );
}
