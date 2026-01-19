/**
 * Shared formatting utilities for the IREN Community Financials app
 */

/**
 * Format positive cashflow years for display
 * @param {number} years - Years to positive cashflow (out of 20)
 * @returns {string} Formatted string like "5 out of 20 years"
 */
export const formatPaybackYears = (years) => {
  if (!years || years === Infinity || isNaN(years) || years < 0) return 'N/A';
  if (years > 20) return '> 20 years';
  return `${years.toFixed(1)} out of 20 years`;
};

/**
 * Format monetary values in M or B notation
 * @param {number} value - Value in millions
 * @param {string} prefix - Prefix to add (default '$')
 * @param {string} suffix - Suffix to add (default '')
 * @returns {string} Formatted value string
 */
export const formatValue = (value, prefix = '$', suffix = '') => {
  const numValue = Number(value) || 0;
  if (!isFinite(numValue)) return `${prefix}0M${suffix}`;
  if (numValue >= 1000) {
    return `${prefix}${(numValue / 1000).toFixed(2)}B${suffix}`;
  }
  return `${prefix}${numValue.toFixed(0)}M${suffix}`;
};

/**
 * Format share counts in M or B notation
 * @param {number} value - Value in millions
 * @returns {string} Formatted shares string
 */
export const formatShares = (value) => {
  const numValue = Number(value) || 0;
  if (!isFinite(numValue)) return '0M';
  if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(2)}B`;
  }
  return `${numValue.toFixed(1)}M`;
};
