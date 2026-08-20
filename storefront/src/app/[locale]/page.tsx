import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listProducts, listCategories } from "@/lib/api/catalog";
import { getTenantSettings } from "@/lib/tenant";
import { getSelectedCurrency } from "@/lib/currency-cookie";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CategoryTile } from "@/components/catalog/CategoryTile";

export default async function HomePage() {
  const [t, settings] = await Promise.all([getTranslations("home"), getTenantSettings()]);
  const currency = await getSelectedCurrency(settings.default_currency ?? "USD");
  const [featured, categories] = await Promise.all([
    listProducts({ sort: "-created_at", perPage: 8, currency }),
    listCategories(),
  ]);

  return (
    <div>
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark))" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 text-center text-white">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">{settings.name ?? "Welcome"}</h1>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-white text-ink font-semibold px-7 py-3.5 rounded-lg text-sm hover:opacity-90 transition"
          >
            {t("shopNow")}
          </Link>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="font-display text-xl font-bold mb-6">{t("categories")}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((c) => (
              <CategoryTile key={c.id} category={c} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="font-display text-xl font-bold mb-6">{t("featured")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
