"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/store/auth";
import { CartIcon } from "./CartIcon";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SearchBar } from "./SearchBar";

export function Header({ storeName }: { storeName: string }) {
  const t = useTranslations("nav");
  const { customer } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-current/10">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-xs">
        <div className="flex-1" />
        <CurrencySwitcher />
        <LocaleSwitcher />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="font-display text-xl font-bold shrink-0">
          {storeName}
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium shrink-0">
          <Link href="/shop">{t("shop")}</Link>
          <Link href="/brands">{t("brands")}</Link>
          <Link href="/deals">{t("deals")}</Link>
          <Link href="/about">{t("about")}</Link>
          <Link href="/help">{t("help")}</Link>
        </nav>

        <SearchBar className="flex-1 max-w-md hidden sm:block" />

        <div className="flex items-center gap-1 shrink-0 ms-auto">
          <Link href="/wishlist" className="p-2" aria-label={t("wishlist")}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21s-7.5-4.6-10-9.1C.4 8.1 2 4.5 5.6 4c2-.3 3.9.7 5 2.3a5.9 5.9 0 0 1 5-2.3c3.6.5 5.2 4.1 3.6 7.9C19.5 16.4 12 21 12 21z" />
            </svg>
          </Link>
          <CartIcon />
          <Link href={customer ? "/account" : "/login"} className="p-2" aria-label={t("account")}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4.5 20c1.5-4 5-6 7.5-6s6 2 7.5 6" />
            </svg>
          </Link>
        </div>
      </div>
      <SearchBar className="sm:hidden px-4 pb-3" />
    </header>
  );
}
