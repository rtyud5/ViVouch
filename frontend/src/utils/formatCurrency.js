/**
 * Formats a number as Vietnamese currency.
 * Example: 179000 → "179.000 đ"
 *
 * @param {number} value - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  // vi-VN locale uses "." as thousands separator by default
  const formatted = new Intl.NumberFormat("vi-VN").format(value || 0);
  return `${formatted} đ`;
}

