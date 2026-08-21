/**
 * Matches App\Support\ProductPresenter::present() exactly — this is the
 * one hand-authored response shape used consistently by every catalog
 * endpoint (index/show/search), so declaring it once here is more
 * reliable than the generated schema.ts, which independently re-infers
 * (and sometimes loses precision on) the same shape per endpoint.
 */
export interface ProductVariantSummary {
  id: number;
  sku: string;
  attributes: Record<string, string> | null;
  image_url: string | null;
  is_default: boolean;
  in_stock: boolean;
  price: { currency: string; amount_minor: number; formatted: string } | null;
}

export interface ProductSummary {
  id: number;
  sku: string;
  slug: string;
  status: "draft" | "active" | "archived";
  is_featured: boolean;
  locale: string;
  name: string | null;
  description: string | null;
  category_id: number | null;
  brand_id: number | null;
  image_url: string | null;
  price: { currency: string; amount_minor: number; formatted: string } | null;
  discount_badge: string | null;
  variants: ProductVariantSummary[];
}

/** Matches CategoryController@index's map() exactly — note this is
 *  narrower than the full Category model (no is_active/sort_order in
 *  the response; locale-resolved name/description are added instead). */
export interface Category {
  id: number;
  parent_id: number | null;
  slug: string;
  image_url: string | null;
  name: string | null;
  description: string | null;
}

/** Matches BrandController@index's ->get([...]) column selection. */
export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
}
