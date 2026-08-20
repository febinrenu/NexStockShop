"use client";

import type { ReactNode } from "react";
import { CurrencyProvider } from "@/lib/store/currency";
import { AuthProvider } from "@/lib/store/auth";
import { CartProvider } from "@/lib/store/cart";

export function AppProviders({
  defaultCurrency,
  children,
}: {
  defaultCurrency: string;
  children: ReactNode;
}) {
  return (
    <CurrencyProvider defaultCurrency={defaultCurrency}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}
