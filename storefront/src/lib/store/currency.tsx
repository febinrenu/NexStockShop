"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/money";
import { CURRENCY_COOKIE } from "@/lib/currency-shared";

const STORAGE_KEY = "trippleshop.currency";

const CurrencyContext = createContext<{
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
} | null>(null);

export function CurrencyProvider({
  defaultCurrency,
  children,
}: {
  defaultCurrency: string;
  children: ReactNode;
}) {
  const fallback = (SUPPORTED_CURRENCIES as readonly string[]).includes(defaultCurrency)
    ? (defaultCurrency as SupportedCurrency)
    : "USD";
  const [currency, setCurrencyState] = useState<SupportedCurrency>(fallback);
  const router = useRouter();

  useEffect(() => {
    // localStorage doesn't exist during SSR, so reading the stored
    // preference has to happen post-mount rather than as lazy useState
    // init (which would throw server-side).
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (SUPPORTED_CURRENCIES as readonly string[]).includes(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrencyState(stored as SupportedCurrency);
    }
  }, []);

  function setCurrency(c: SupportedCurrency) {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
    // Also mirrored into a cookie (see currency-cookie.ts) so
    // server-rendered pages (home/shop/PDP) can read the same choice and
    // fetch prices in it — localStorage alone is invisible to the server.
    document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
