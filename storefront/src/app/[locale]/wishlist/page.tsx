"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/store/auth";
import { useCart } from "@/lib/store/cart";
import { useProductLookup } from "@/hooks/useProductLookup";
import * as commerce from "@/lib/api/commerce";
import type { WishlistRaw } from "@/lib/api/raw-types";

export default function WishlistPage() {
  const t = useTranslations("wishlist");
  const { customer, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<WishlistRaw | null>(null);

  useEffect(() => {
    if (!authLoading && !customer) router.replace("/login");
  }, [authLoading, customer, router]);

  useEffect(() => {
    if (customer) commerce.getWishlist().then(setWishlist);
  }, [customer]);

  const items = wishlist?.items ?? [];
  const lookup = useProductLookup(items.map((i) => i.product_variant.product.id));

  if (!customer) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">{t("title")}</h1>

      {items.length === 0 ? (
        <p className="text-ink-muted">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-current/10">
          {items.map((item) => {
            const product = lookup[item.product_variant.product.id];
            return (
              <li key={item.id} className="py-4 flex gap-4 items-center">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-alt shrink-0">
                  {item.product_variant.image_url && (
                    <Image src={item.product_variant.image_url} alt={product?.name ?? item.product_variant.sku} fill className="object-cover" />
                  )}
                </div>
                <Link href={`/products/${item.product_variant.product.id}`} className="flex-1 min-w-0 font-medium truncate">
                  {product?.name ?? item.product_variant.sku}
                </Link>
                <button
                  onClick={() => addItem(item.product_variant.id, 1)}
                  className="text-sm font-semibold text-primary shrink-0"
                >
                  {t("moveToCart")}
                </button>
                <button
                  onClick={async () => {
                    await commerce.removeWishlistItem(item.id);
                    setWishlist(await commerce.getWishlist());
                  }}
                  className="text-sm text-ink-muted hover:text-accent shrink-0"
                >
                  {t("remove")}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
