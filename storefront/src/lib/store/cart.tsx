"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartRaw } from "@/lib/api/raw-types";
import * as commerce from "@/lib/api/commerce";

const CartContext = createContext<{
  cart: CartRaw | null;
  loading: boolean;
  itemCount: number;
  refresh: () => Promise<void>;
  addItem: (variantId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartRaw | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setCart(await commerce.getCart());
  }, []);

  useEffect(() => {
    // Fetch-on-mount to sync with the backend cart — an external system,
    // not state derivable from props/existing state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addItem = useCallback(async (variantId: number, quantity: number) => {
    setCart(await commerce.addCartItem(variantId, quantity));
  }, []);

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    setCart(await commerce.updateCartItem(itemId, quantity));
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    setCart(await commerce.removeCartItem(itemId));
  }, []);

  const clear = useCallback(async () => {
    await commerce.clearCart();
    await refresh();
  }, [refresh]);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, refresh, addItem, updateItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
