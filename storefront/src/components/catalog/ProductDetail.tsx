"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ProductSummary, ProductVariantSummary } from "@/lib/api/product-types";
import { useCart } from "@/lib/store/cart";
import { useAuth } from "@/lib/store/auth";
import { addWishlistItem } from "@/lib/api/commerce";
import { PriceTag } from "./PriceTag";

export function ProductDetail({ product }: { product: ProductSummary }) {
  const t = useTranslations("product");
  const tn = useTranslations("nav");
  const { addItem } = useCart();
  const { customer } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);

  const [selected, setSelected] = useState<ProductVariantSummary>(
    product.variants.find((v) => v.is_default) ?? product.variants[0],
  );
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    product.variants.forEach((v) => Object.keys(v.attributes ?? {}).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [product.variants]);

  const image = selected?.image_url ?? product.image_url;

  async function handleAddToCart() {
    if (!selected) return;
    setAdding(true);
    await addItem(selected.id, quantity);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-alt">
        {image ? (
          <Image src={image} alt={product.name ?? product.sku} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-muted">
            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        {product.discount_badge && (
          <span className="absolute top-3 start-3 text-xs font-bold px-2 py-1 rounded bg-accent text-white">
            {product.discount_badge}
          </span>
        )}
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold">{product.name ?? product.sku}</h1>
        {selected?.price && (
          <PriceTag amountMinor={selected.price.amount_minor} currency={selected.price.currency} className="mt-3 text-lg" />
        )}

        {attributeKeys.map((key) => (
          <div key={key} className="mt-4">
            <p className="text-sm font-medium mb-2 capitalize">{key}</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const value = v.attributes?.[key];
                if (!value) return null;
                const isActive = selected?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelected(v)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                      isActive ? "bg-primary text-white border-primary" : "border-current/20 hover:border-primary"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-6 flex items-center gap-3">
          <label className="text-sm font-medium">{t("quantity")}</label>
          <div className="flex items-center border border-current/20 rounded-lg">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8" aria-label="Decrease">
              −
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="w-8 h-8" aria-label="Increase">
              +
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!selected?.in_stock || adding}
            className="flex-1 sm:flex-none px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark transition text-white font-semibold disabled:opacity-50"
          >
            {selected?.in_stock ? (added ? "✓" : t("addToCart")) : t("outOfStock")}
          </button>
          {customer && (
            <button
              onClick={async () => {
                if (!selected) return;
                await addWishlistItem(selected.id);
                setWishlisted(true);
              }}
              aria-label={tn("wishlist")}
              className="px-4 py-3 rounded-lg border border-current/20 hover:border-primary transition"
            >
              {wishlisted ? "♥" : "♡"}
            </button>
          )}
        </div>

        {product.description && (
          <div className="mt-8">
            <h2 className="font-semibold mb-2">{t("description")}</h2>
            <p className="text-sm text-ink-muted whitespace-pre-line">{product.description}</p>
          </div>
        )}

        <p className="mt-6 text-xs text-ink-muted">
          {t("sku")}: {selected?.sku ?? product.sku}
        </p>
      </div>
    </div>
  );
}
