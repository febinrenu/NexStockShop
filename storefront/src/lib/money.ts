/**
 * Every price in Person A's API is a currency code + minor-unit integer
 * (see backend/README.md's "Multi-currency" section) — never a float.
 * This formats that pair for display; it never does the reverse (turning
 * a float back into minor units), since the API is always the source of
 * truth for amounts.
 */
export function formatMinor(amountMinor: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amountMinor / 100);
  } catch {
    // Intl.NumberFormat throws on a currency code it doesn't recognize
    // (e.g. a regional code not yet in every runtime's CLDR data) — CFA
    // is exactly this case in some environments. Fall back to a plain
    // minor-unit division with the raw code appended.
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}

export const SUPPORTED_CURRENCIES = ["USD", "SAR", "CFA"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
