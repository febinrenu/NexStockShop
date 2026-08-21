/**
 * Hand-declared response shapes for endpoints whose controllers return
 * raw Eloquent models/relations via `response()->json($model)` rather
 * than a typed API Resource — Scramble's static analysis can't infer
 * field types from that pattern (e.g. it generated `CartItem: string[]`
 * in schema.ts, which is wrong). These are transcribed directly from the
 * backend's own migrations/models (backend/database/migrations/tenant/*,
 * backend/app/Models/Tenant/*), which this same author wrote, so they're
 * exact, not guessed.
 */

export interface ProductVariantRaw {
  id: number;
  product_id: number;
  sku: string;
  attributes: Record<string, string> | null;
  image_url: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItemRaw {
  id: number;
  cart_id: number;
  product_variant_id: number;
  quantity: number;
  unit_price_minor: number;
  created_at: string;
  updated_at: string;
  product_variant: ProductVariantRaw;
}

export interface CartRaw {
  id: number;
  guest_token: string;
  currency: string;
  items: CartItemRaw[];
  subtotal_minor: number;
}

export interface WishlistItemRaw {
  id: number;
  wishlist_id: number;
  product_variant_id: number;
  created_at: string;
  updated_at: string;
  product_variant: ProductVariantRaw & {
    product: {
      id: number;
      category_id: number | null;
      brand_id: number | null;
      sku: string;
      slug: string;
      status: string;
      is_featured: boolean;
    };
  };
}

export interface WishlistRaw {
  id: number;
  customer_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  items: WishlistItemRaw[];
}

export interface AddressRaw {
  id: number;
  customer_id: number;
  label: string | null;
  recipient_name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
}

export interface OrderItemRaw {
  id: number;
  order_id: number;
  product_variant_id: number | null;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price_minor: number;
  line_total_minor: number;
}

export interface OrderStatusHistoryRaw {
  id: number;
  order_id: number;
  status: string;
  note: string | null;
  created_at: string;
}

export interface ShipmentRaw {
  id: number;
  order_id: number;
  carrier: string | null;
  tracking_number: string | null;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface OrderRaw {
  id: number;
  order_number: string;
  customer_id: number | null;
  checkout_session_id: number | null;
  status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
  currency: string;
  subtotal_minor: number;
  discount_minor: number;
  shipping_minor: number;
  total_minor: number;
  shipping_address_id: number | null;
  placed_at: string | null;
  items?: OrderItemRaw[];
  shipment?: ShipmentRaw | null;
  statusHistory?: OrderStatusHistoryRaw[];
}

export interface ReviewRaw {
  id: number;
  product_id: number;
  customer_id: number;
  rating: number;
  title: string | null;
  body: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  customer?: { id: number; name: string };
}

export interface PaginatedRaw<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
