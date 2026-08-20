"use client";

/**
 * Browser-only storage for the two tokens this storefront ever needs:
 * a Sanctum bearer token once a shopper logs in/registers (customer
 * guard — see backend/routes/tenant.php's customer/auth group), and a
 * guest-cart token before that (backend/app/Http/Controllers/Tenant/CartController.php
 * issues one on first add-to-cart and expects it back as X-Guest-Token on
 * every subsequent cart call so an anonymous cart survives a refresh).
 */
const AUTH_TOKEN_KEY = "trippleshop.customer_token";
const GUEST_TOKEN_KEY = "trippleshop.guest_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getGuestToken(): string | null {
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function setGuestToken(token: string): void {
  localStorage.setItem(GUEST_TOKEN_KEY, token);
}

export function clearGuestToken(): void {
  localStorage.removeItem(GUEST_TOKEN_KEY);
}
