"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Category, Brand } from "@/lib/api/product-types";

export function ShopFilters({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const t = useTranslations("shop");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <aside className="space-y-6">
      <h2 className="font-semibold">{t("filters")}</h2>

      <div>
        <label className="block text-sm font-medium mb-1">{t("category")}</label>
        <select
          className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
          value={searchParams.get("category") ?? ""}
          onChange={(e) => setParam("category", e.target.value)}
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name ?? c.slug}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t("brand")}</label>
        <select
          className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
          value={searchParams.get("brand") ?? ""}
          onChange={(e) => setParam("brand", e.target.value)}
        >
          <option value="">{t("allBrands")}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t("sort")}</label>
        <select
          className="w-full rounded-lg bg-surface-alt border border-current/10 px-3 py-2 text-sm"
          value={searchParams.get("sort") ?? "-created_at"}
          onChange={(e) => setParam("sort", e.target.value)}
        >
          <option value="-created_at">{t("sortNewest")}</option>
          <option value="sku">{t("sortSku")}</option>
        </select>
      </div>
    </aside>
  );
}
