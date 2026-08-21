"use client";

import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/store/cart";

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="relative inline-flex items-center justify-center p-2" aria-label="Cart">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="21" r="1.3" />
        <circle cx="18" cy="21" r="1.3" />
        <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -end-0.5 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
