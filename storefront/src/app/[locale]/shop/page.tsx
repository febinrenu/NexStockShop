import { getTranslations } from "next-intl/server";
import { listProducts, listCategories, listBrands, searchProducts } from "@/lib/api/catalog";
import { getTenantSettings } from "@/lib/tenant";
import { getSelectedCurrency } from "@/lib/currency-cookie";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ShopFilters } from "@/components/catalog/ShopFilters";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; sort?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const [t, settings] = await Promise.all([getTranslations("shop"), getTenantSettings()]);
  const currency = await getSelectedCurrency(settings.default_currency ?? "USD");

  const [result, categories, brands] = await Promise.all([
    params.q
      ? searchProducts(params.q, currency)
      : listProducts({
          categoryId: params.category,
          brandId: params.brand,
          sort: params.sort,
          page: params.page ? Number(params.page) : undefined,
          currency,
        }),
    listCategories(),
    listBrands(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-1">{t("title")}</h1>
      <p className="text-sm text-ink-muted mb-6">{t("resultsCount", { count: result.meta.total })}</p>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <ShopFilters categories={categories} brands={brands} />

        <div>
          {result.data.length === 0 ? (
            <p className="text-ink-muted py-12 text-center">{t("noResults")}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {result.data.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
