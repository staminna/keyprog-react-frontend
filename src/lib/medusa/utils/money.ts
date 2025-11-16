/**
 * Money formatting utilities
 * Provides locale-aware currency formatting
 * Extracted from Medusa storefront
 */

import { isEmpty } from "./isEmpty";

type ConvertToLocaleParams = {
  amount: number;
  currency_code: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
};

/**
 * Convert an amount to a locale-formatted currency string
 * @param amount - The numeric amount to format
 * @param currency_code - The ISO 4217 currency code (e.g., "USD", "EUR")
 * @param minimumFractionDigits - Minimum decimal places
 * @param maximumFractionDigits - Maximum decimal places
 * @param locale - The locale to use for formatting (default: "en-US")
 * @returns Formatted currency string
 */
export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams): string => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString();
};
