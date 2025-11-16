/**
 * Calculate percentage difference between original and calculated price
 * Used for displaying discount percentages
 * Extracted from Medusa storefront
 */

export const getPercentageDiff = (original: number, calculated: number): string => {
  const diff = original - calculated;
  const decrease = (diff / original) * 100;

  return decrease.toFixed();
};
