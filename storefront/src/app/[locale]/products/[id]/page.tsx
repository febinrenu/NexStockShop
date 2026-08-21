import { notFound } from "next/navigation";
import { getProduct, listProductReviews } from "@/lib/api/catalog";
import { getTenantSettings } from "@/lib/tenant";
import { getSelectedCurrency } from "@/lib/currency-cookie";
import { ProductDetail } from "@/components/catalog/ProductDetail";
import { ReviewList } from "@/components/catalog/ReviewList";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settings = await getTenantSettings();
  const currency = await getSelectedCurrency(settings.default_currency ?? "USD");
  const product = await getProduct(id, currency);
  if (!product) notFound();

  const reviews = await listProductReviews(id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ProductDetail product={product} />
      <ReviewList productId={product.id} reviews={reviews} />
    </div>
  );
}
