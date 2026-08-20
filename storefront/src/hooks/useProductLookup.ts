"use client";

import { useEffect, useState } from "react";
import { getProductForDisplay } from "@/lib/api/commerce";
import type { ProductSummary } from "@/lib/api/product-types";

/**
 * Resolves product_id[] -> ProductSummary for display purposes (name,
 * image) on the cart/wishlist pages, whose API responses only nest a raw
 * ProductVariant (product_id, sku, attributes) — see getProductForDisplay.
 */
export function useProductLookup(productIds: number[]): Record<number, ProductSummary> {
  const [lookup, setLookup] = useState<Record<number, ProductSummary>>({});
  const key = productIds.slice().sort().join(",");

  useEffect(() => {
    let cancelled = false;
    const unique = Array.from(new Set(productIds));
    Promise.all(unique.map((id) => getProductForDisplay(id))).then((results) => {
      if (cancelled) return;
      const next: Record<number, ProductSummary> = {};
      unique.forEach((id, i) => {
        const product = results[i];
        if (product) next[id] = product;
      });
      setLookup(next);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return lookup;
}
