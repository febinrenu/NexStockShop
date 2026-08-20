"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/store/cart";
import { useProductLookup } from "@/hooks/useProductLookup";
import { formatMinor } from "@/lib/money";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { cart, loading, updateItem, removeItem } = useCart();
  const items = cart?.items ?? [];
  const lookup = useProductLookup(items.map((i) => i.product_variant.product_id));

  if (loading) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-muted mb-4">{t("empty")}</p>
        <Link href="/shop" className="text-primary font-semibold">
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">{t("title")}</h1>

      <ul className="divide-y divide-current/10">
        {items.map((item) => {
          const product = lookup[item.product_variant.product_id];
          return (
            <li key={item.id} className="py-4 flex gap-4 items-center">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-alt shrink-0">
                {item.product_variant.image_url && (
                  <Image src={item.product_variant.image_url} alt={product?.name ?? item.product_variant.sku} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product?.name ?? item.product_variant.sku}</p>
                <p className="text-sm text-ink-muted">{formatMinor(item.unit_price_minor, cart!.currency, locale)}</p>
              </div>
              <div className="flex items-center border border-current/20 rounded-lg shrink-0">
                <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8" aria-label="Decrease">
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button onClick={() => updateItem(item.id, item.quantity + 1)} className="w-8 h-8" aria-label="Increase">
                  +
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-sm text-ink-muted hover:text-accent shrink-0">
                {t("remove")}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-current/10 pt-4">
        <span className="font-semibold">{t("subtotal")}</span>
        <span className="font-semibold text-lg">{formatMinor(cart!.subtotal_minor, cart!.currency, locale)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full text-center px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark transition text-white font-semibold"
      >
        {t("checkout")}
      </Link>
    </div>
  );
}
