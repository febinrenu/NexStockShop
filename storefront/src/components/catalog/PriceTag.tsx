"use client";

import { useLocale } from "next-intl";
import { formatMinor } from "@/lib/money";

export function PriceTag({
  amountMinor,
  currency,
  discountBadge,
  className = "",
}: {
  amountMinor: number;
  currency: string;
  discountBadge?: string | null;
  className?: string;
}) {
  const locale = useLocale();

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="font-semibold">{formatMinor(amountMinor, currency, locale)}</span>
      {discountBadge && (
        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-accent text-white">{discountBadge}</span>
      )}
    </span>
  );
}
