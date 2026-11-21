/**
 * Standardized numerical and currency formatting utilities for Uban Harkalla.
 * Ensures consistent Nigerian Naira (₦) display with thousands comma separators.
 */

/**
 * Format a numeric or string value as a currency string with ₦ and commas.
 * Examples:
 *   formatPrice(1650000) => "₦1,650,000"
 *   formatPrice("1650000.00") => "₦1,650,000"
 *   formatPrice(0) => "₦0"
 */
export function formatPrice(amount) {
  if (amount === null || amount === undefined || amount === '') return '₦0';
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(num)) return '₦0';
  return `₦${Math.round(num).toLocaleString('en-NG')}`;
}

/**
 * Format a numeric or string value with thousands comma separators.
 * Examples:
 *   formatNumber(1650000) => "1,650,000"
 *   formatNumber("1650000.00") => "1,650,000"
 *   formatNumber(0) => "0"
 */
export function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return '0';
  return Math.round(num).toLocaleString('en-NG');
}
