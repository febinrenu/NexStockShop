import "server-only";
import { cookies } from "next/headers";
import { SUPPORTED_CURRENCIES } from "@/lib/money";
import { CURRENCY_COOKIE } from "@/lib/currency-shared";

/** Server-side counterpart to CurrencyProvider — reads the same cookie
 *  it writes, so server-rendered pages (home/shop/PDP) actually fetch
 *  prices in whatever currency the header switcher last selected,
 *  instead of always showing the tenant's default. */
export async function getSelectedCurrency(fallback: string): Promise<string> {
  const stored = (await cookies()).get(CURRENCY_COOKIE)?.value;
  if (stored && (SUPPORTED_CURRENCIES as readonly string[]).includes(stored)) return stored;
  return fallback;
}
