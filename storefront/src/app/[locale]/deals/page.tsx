import { getTranslations } from "next-intl/server";
import { listProducts } from "@/lib/api/catalog";
import { getTenantSettings } from "@/lib/tenant";
import { getSelectedCurrency } from "@/lib/currency-cookie";
import { ProductCard } from "@/components/catalog/ProductCard";

export default async function DealsPage() {
  const [t, settings] = await Promise.all([getTranslations("deals"), getTenantSettings()]);
  const currency = await getSelectedCurrency(settings.default_currency ?? "USD");
  const result = await listProducts({ perPage: 48, currency });
  const deals = result.data.filter((p) => p.discount_badge);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-1">{t("title")}</h1>
      <p className="text-sm text-ink-muted mb-6">{t("subtitle")}</p>

      {deals.length === 0 ? (
        <p className="text-ink-muted py-12 text-center">—</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
