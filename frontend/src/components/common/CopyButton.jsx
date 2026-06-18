import React, { useState } from 'react';

/**
 * Reusable CopyButton component to copy text to clipboard with tooltip status.
 *
 * @param {Object} props
 * @param {string} props.text - The text string to copy to clipboard
 * @param {string} [props.className] - Additional Tailwind classes for styling
 * @returns {React.ReactElement}
 */
export function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!text || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-primary hover:text-surface-tint transition-colors focus:outline-none group relative flex items-center justify-center ${className}`}
      title={copied ? 'Đã sao chép' : 'Sao chép'}
      type="button"
    >
      <span className="material-symbols-outlined text-[20px]">
        {copied ? 'check' : 'content_copy'}
      </span>
      {/* Tooltip */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-50">
        {copied ? 'Đã sao chép!' : 'Sao chép'}
      </span>
    </button>
  );
}
