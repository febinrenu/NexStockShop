"use client";

import { useCurrency } from "@/lib/store/currency";
import { SUPPORTED_CURRENCIES } from "@/lib/money";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as (typeof SUPPORTED_CURRENCIES)[number])}
      className="bg-transparent text-sm border border-current/20 rounded px-2 py-1 cursor-pointer"
      aria-label="Currency"
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c} className="text-black">
          {c}
        </option>
      ))}
    </select>
  );
}
