"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProductSummary } from "@/lib/api/product-types";
import { PriceTag } from "./PriceTag";

export function ProductCard({ product }: { product: ProductSummary }) {
  const defaultVariant = product.variants.find((v) => v.is_default) ?? product.variants[0];
  const image = product.image_url ?? defaultVariant?.image_url ?? null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block rounded-xl overflow-hidden bg-surface shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="relative aspect-square bg-surface-alt">
        {image ? (
          <Image src={image} alt={product.name ?? product.sku} fill className="object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <PlaceholderThumb />
        )}
        {product.discount_badge && (
          <span className="absolute top-2 start-2 text-xs font-bold px-2 py-1 rounded bg-accent text-white">
            {product.discount_badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium line-clamp-2 min-h-[2.5em]">{product.name ?? product.sku}</p>
        {product.price && <PriceTag amountMinor={product.price.amount_minor} currency={product.price.currency} className="mt-1" />}
        <InStockBadge inStock={defaultVariant?.in_stock ?? false} />
      </div>
    </Link>
  );
}

function InStockBadge({ inStock }: { inStock: boolean }) {
  const t = useTranslations("product");
  if (inStock) return null;
  return <p className="mt-1 text-xs text-ink-muted">{t("outOfStock")}</p>;
}

function PlaceholderThumb() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-ink-muted">
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  );
}
