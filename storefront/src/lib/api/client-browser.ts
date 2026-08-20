"use client";

import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";
import { clientApiBaseUrl } from "./config";
import { getAuthToken, getGuestToken, setGuestToken } from "./storage";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getAuthToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    const guestToken = getGuestToken();
    if (guestToken && request.url.includes("/cart")) {
      request.headers.set("X-Guest-Token", guestToken);
    }
    return request;
  },
  async onResponse({ response }) {
    // Cart endpoints hand back a guest_token in the JSON body (not a
    // header) the first time an anonymous cart is created — capture it
    // so the next call carries it. See CartController::cartResponse.
    if (response.url.includes("/cart") && response.ok) {
      const clone = response.clone();
      try {
        const body = await clone.json();
        if (body?.guest_token) setGuestToken(body.guest_token);
      } catch {
        // non-JSON or empty body — nothing to capture
      }
    }
    return response;
  },
};

let cached: ReturnType<typeof createClient<paths>> | null = null;
let cachedForBase: string | null = null;

/** Lazily created, memoized per-origin — every call site gets the same
 *  instance for a given tenant host without re-attaching middleware. */
export function browserApiClient() {
  const base = clientApiBaseUrl();
  if (!cached || cachedForBase !== base) {
    cached = createClient<paths>({ baseUrl: base });
    cached.use(authMiddleware);
    cachedForBase = base;
  }
  return cached;
}
