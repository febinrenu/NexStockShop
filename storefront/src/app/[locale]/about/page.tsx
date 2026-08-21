import { getTranslations } from "next-intl/server";
import { getTenantSettings } from "@/lib/tenant";

export default async function AboutPage() {
  const t = await getTranslations("about");
  const settings = await getTenantSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-2xl font-bold mb-4">{t("title")}</h1>
      <p className="text-ink-muted leading-relaxed">
        {settings.name} is a storefront built on TrippleShop — a multi-tenant platform where every seller gets
        their own branded store, catalog, and checkout, backed by a shared, dependable commerce engine.
      </p>
    </div>
  );
}
