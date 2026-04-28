/**
 * Currency formatting helpers
 * These work independently of React context for use in non-component code.
 */

/** Format a number as LKR (Sri Lankan Rupee) string */
export const formatLKR = (n) => {
    const num = parseFloat(n);
    if (isNaN(num) || num === 0) return '—';
    return 'LKR ' + num.toLocaleString('en-LK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

/** Convert LKR amount to USD using exchange rates */
export const lkrToUsd = (lkrAmount, rates = {}) => {
    const num = parseFloat(lkrAmount);
    if (isNaN(num)) return 0;
    const lkrRate = rates?.LKR || 330;
    if (lkrRate <= 0) return num;
    return num / lkrRate;
};
