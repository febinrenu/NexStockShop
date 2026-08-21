import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/lib/api/product-types";

export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link href={`/shop?category=${category.id}`} className="group flex flex-col items-center gap-2">
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-surface-alt shadow-card group-hover:shadow-card-hover transition-shadow">
        {category.image_url && (
          <Image src={category.image_url} alt={category.name ?? category.slug} fill className="object-cover" />
        )}
      </div>
      <span className="text-xs font-medium text-center line-clamp-1">{category.name ?? category.slug}</span>
    </Link>
  );
}
