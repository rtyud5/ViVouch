import { useState, useEffect, useRef } from "react";

/**
 * SearchInput
 *
 * Ô tìm kiếm có debounce (mặc định 300ms) dùng setTimeout / clearTimeout.
 *
 * Props:
 *  value       {string}   - giá trị đồng bộ từ URL / parent
 *  onChange    {function} - gọi sau khi debounce xong
 *  placeholder {string}
 *  delay       {number}   - ms debounce (mặc định 300)
 *  className   {string}   - class bổ sung cho wrapper
 */
export function SearchInput({
  value = "",
  onChange = () => {},
  placeholder = "Tìm kiếm voucher...",
  delay = 300,
  className = "",
}) {
  const [localValue, setLocalValue] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Đồng bộ khi parent thay đổi (URL restore, reset filter, back/forward)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce: chỉ gọi onChange sau `delay` ms kể từ lần gõ cuối
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeRef.current(localValue);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, delay, value]);

  function handleClear() {
    setLocalValue("");
    onChangeRef.current("");
  }

  return (
    <div
      className={`flex-1 flex items-center bg-surface-container-low rounded-xl px-3 py-2 border border-outline-variant focus-within:border-primary transition-colors ${className}`}
    >
      {/* Icon tìm kiếm */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 text-on-surface-variant mr-2 shrink-0"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
      </svg>

      <input
        id="voucher-search-input"
        type="search"
        aria-label="Tìm kiếm voucher"
        className="flex-1 bg-transparent border-none outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant p-0 focus:ring-0"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />

      {/* Nút xóa — chỉ hiện khi có text */}
      {localValue && (
        <button
          type="button"
          aria-label="Xóa tìm kiếm"
          onClick={handleClear}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded-full bg-surface-container-high ml-2 shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
