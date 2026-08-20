import "server-only";
import { serverApiClient } from "./server";
import type { ProductSummary, Category, Brand } from "./product-types";
import type { PaginatedRaw, ReviewRaw } from "./raw-types";

export interface ProductListParams {
  locale?: string;
  currency?: string;
  categoryId?: number | string;
  brandId?: number | string;
  sort?: string;
  page?: number;
  perPage?: number;
}

export interface ProductListResult {
  data: ProductSummary[];
  meta: { current_page: number; last_page: number; total: number };
  locale: string;
  currency: string;
}

// openapi-fetch types query/path params from Scramble's inference, which
// is unreliable for the same reason response bodies are (see raw-types.ts)
// — these are plain GET query strings, so `as never` sidesteps that
// rather than fighting an already-untrustworthy generated shape.

export async function listProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const client = await serverApiClient();
  const query: Record<string, string> = {};
  if (params.currency) query.currency = params.currency;
  if (params.sort) query.sort = params.sort;
  if (params.page) query.page = String(params.page);
  if (params.perPage) query.per_page = String(params.perPage);
  if (params.categoryId) query["filter[category_id]"] = String(params.categoryId);
  if (params.brandId) query["filter[brand_id]"] = String(params.brandId);
  if (params.locale) query.lang = params.locale;

  const { data, error } = await client.GET("/v1/products", { params: { query } as never });
  if (error || !data) return { data: [], meta: { current_page: 1, last_page: 1, total: 0 }, locale: "en", currency: "USD" };
  return data as unknown as ProductListResult;
}

export async function getProduct(id: number | string, currency?: string, locale?: string): Promise<ProductSummary | null> {
  const client = await serverApiClient();
  const query: Record<string, string> = {};
  if (currency) query.currency = currency;
  if (locale) query.lang = locale;
  const { data, error } = await client.GET("/v1/products/{product}", {
    params: { path: { product: String(id) }, query } as never,
  });
  if (error || !data) return null;
  return data as unknown as ProductSummary;
}

export async function listCategories(locale?: string): Promise<Category[]> {
  const client = await serverApiClient();
  const { data, error } = await client.GET("/v1/categories", {
    params: { query: locale ? { lang: locale } : {} } as never,
  });
  if (error || !data) return [];
  return (data as unknown as { data: Category[] }).data;
}

export async function listBrands(): Promise<Brand[]> {
  const client = await serverApiClient();
  const { data, error } = await client.GET("/v1/brands");
  if (error || !data) return [];
  return (data as unknown as { data: Brand[] }).data;
}

export async function searchProducts(q: string, currency?: string, locale?: string): Promise<ProductListResult> {
  const client = await serverApiClient();
  const query: Record<string, string> = { q };
  if (currency) query.currency = currency;
  if (locale) query.lang = locale;
  const { data, error } = await client.GET("/v1/search", { params: { query } as never });
  if (error || !data) return { data: [], meta: { current_page: 1, last_page: 1, total: 0 }, locale: "en", currency: "USD" };
  return data as unknown as ProductListResult;
}

export async function listProductReviews(productId: number | string, page = 1): Promise<PaginatedRaw<ReviewRaw>> {
  const client = await serverApiClient();
  const { data, error } = await client.GET("/v1/products/{product}/reviews", {
    params: { path: { product: String(productId) }, query: { page: String(page) } } as never,
  });
  if (error || !data) return { data: [], current_page: 1, last_page: 1, total: 0, per_page: 10 };
  return data as unknown as PaginatedRaw<ReviewRaw>;
}
