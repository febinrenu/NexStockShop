import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { listBrands } from "@/lib/api/catalog";
import { Link } from "@/i18n/navigation";

export default async function BrandsPage() {
  const t = await getTranslations("brands");
  const brands = await listBrands();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">{t("title")}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/shop?brand=${b.id}`}
            className="flex flex-col items-center gap-2 p-6 rounded-xl bg-surface-alt shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="relative w-full h-12">
              {b.logo_url ? (
                <Image src={b.logo_url} alt={b.name} fill className="object-contain" />
              ) : (
                <p className="text-center font-semibold">{b.name}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
