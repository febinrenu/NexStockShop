"use client";

import { browserApiClient } from "./client-browser";
import type { CartRaw, WishlistRaw, OrderRaw, AddressRaw, PaginatedRaw } from "./raw-types";
import type { ProductSummary } from "./product-types";

export async function getCart(): Promise<CartRaw> {
  const { data } = await browserApiClient().GET("/v1/cart");
  return data as unknown as CartRaw;
}

/**
 * Cart/wishlist responses only nest a raw ProductVariant (see CartController
 * ::cartResponse's `.with('productVariant')`) — no product name/image,
 * since that lives on the parent Product + its translations. The cart/
 * wishlist pages resolve those by product_id through this, one call per
 * distinct product represented (small numbers in a cart, so no batching).
 */
export async function getProductForDisplay(productId: number): Promise<ProductSummary | null> {
  const { data, error } = await browserApiClient().GET("/v1/products/{product}", {
    params: { path: { product: String(productId) } } as never,
  });
  if (error || !data) return null;
  return data as unknown as ProductSummary;
}

export async function addCartItem(productVariantId: number, quantity: number): Promise<CartRaw> {
  const { data } = await browserApiClient().POST("/v1/cart/items", {
    body: { product_variant_id: productVariantId, quantity },
  });
  return data as unknown as CartRaw;
}

export async function updateCartItem(itemId: number, quantity: number): Promise<CartRaw> {
  const { data } = await browserApiClient().PATCH("/v1/cart/items/{itemId}", {
    params: { path: { itemId } },
    body: { quantity },
  });
  return data as unknown as CartRaw;
}

export async function removeCartItem(itemId: number): Promise<CartRaw> {
  const { data } = await browserApiClient().DELETE("/v1/cart/items/{itemId}", {
    params: { path: { itemId } },
  });
  return data as unknown as CartRaw;
}

export async function clearCart(): Promise<void> {
  await browserApiClient().DELETE("/v1/cart");
}

export async function getWishlist(): Promise<WishlistRaw> {
  const { data } = await browserApiClient().GET("/v1/wishlist");
  return data as unknown as WishlistRaw;
}

export async function addWishlistItem(productVariantId: number): Promise<WishlistRaw> {
  const { data } = await browserApiClient().POST("/v1/wishlist", {
    body: { product_variant_id: productVariantId },
  });
  return data as unknown as WishlistRaw;
}

export async function removeWishlistItem(itemId: number): Promise<void> {
  await browserApiClient().DELETE("/v1/wishlist/{itemId}", { params: { path: { itemId } } });
}

export async function listOrders(page = 1): Promise<PaginatedRaw<OrderRaw>> {
  const { data } = await browserApiClient().GET("/v1/orders", { params: { query: { page: String(page) } } as never });
  return data as unknown as PaginatedRaw<OrderRaw>;
}

export async function getOrder(orderId: number): Promise<OrderRaw> {
  const { data } = await browserApiClient().GET("/v1/orders/{order}", { params: { path: { order: orderId } } });
  return data as unknown as OrderRaw;
}

export async function getOrderTracking(orderId: number): Promise<{
  order_number: string;
  status: string;
  history: OrderRaw["statusHistory"];
  shipment: OrderRaw["shipment"];
}> {
  const { data } = await browserApiClient().GET("/v1/orders/{order}/tracking", {
    params: { path: { order: orderId } },
  });
  return data as unknown as { order_number: string; status: string; history: OrderRaw["statusHistory"]; shipment: OrderRaw["shipment"] };
}

export async function submitReview(productId: number, rating: number, title: string, body: string) {
  return browserApiClient().POST("/v1/reviews", {
    body: { product_id: productId, rating, title, body },
  });
}

export async function subscribeNewsletter(email: string) {
  return browserApiClient().POST("/v1/newsletter/subscribe", { body: { email } });
}

/**
 * Matches CheckoutSession::create()'s actual columns exactly (see
 * backend/database/migrations/tenant/..._create_checkout_sessions_table.php)
 * — shipping_address_id is a nullable FK to a saved address, not an
 * inline object, and there is no order_id column on the session at all
 * (complete() returns the created Order directly instead).
 */
export interface CheckoutSessionRaw {
  id: number;
  cart_id: string;
  customer_id: number | null;
  status: "started" | "address" | "shipping" | "payment" | "complete";
  shipping_address_id: number | null;
  shipping_method: string | null;
  payment_method: string | null;
  totals: { subtotal_minor: number } | null;
}

export async function createCheckoutSession(cartId: number): Promise<CheckoutSessionRaw> {
  const { data } = await browserApiClient().POST("/v1/checkout/session", {
    body: { cart_id: cartId } as never,
  });
  return data as unknown as CheckoutSessionRaw;
}

export async function updateCheckoutSession(
  sessionId: number,
  patch: Partial<{
    status: Exclude<CheckoutSessionRaw["status"], "started">;
    shipping_address_id: number;
    shipping_method: string;
    payment_method: string;
  }>,
): Promise<CheckoutSessionRaw> {
  const { data } = await browserApiClient().PATCH("/v1/checkout/session/{session}", {
    params: { path: { session: sessionId } },
    body: patch as never,
  });
  return data as unknown as CheckoutSessionRaw;
}

export async function completeCheckoutSession(sessionId: number): Promise<OrderRaw> {
  const { data } = await browserApiClient().POST("/v1/checkout/session/{session}/complete", {
    params: { path: { session: sessionId } },
  });
  return data as unknown as OrderRaw;
}

export async function listAddresses(): Promise<AddressRaw[]> {
  const { data } = await browserApiClient().GET("/v1/me/addresses");
  return data as unknown as AddressRaw[];
}

export async function createAddress(input: Omit<AddressRaw, "id" | "customer_id">): Promise<AddressRaw> {
  const { data } = await browserApiClient().POST("/v1/me/addresses", { body: input as never });
  return data as unknown as AddressRaw;
}
