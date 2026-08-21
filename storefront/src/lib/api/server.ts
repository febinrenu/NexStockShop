import "server-only";
import { headers } from "next/headers";
import createClient from "openapi-fetch";
import type { paths } from "./schema";
import { apiBaseUrlForHost } from "./config";

/**
 * Server Component / Route Handler client — resolves the tenant purely
 * from the incoming request's own Host header, so it always talks to the
 * same tenant the browser is currently on. Unauthenticated: only use this
 * for public catalog/content reads (products, categories, brands,
 * settings, search) — authenticated customer actions (cart, orders,
 * wishlist) go through the browser client in client-browser.ts instead,
 * since the Sanctum token lives in the browser, not on the server.
 */
export async function serverApiClient() {
  const host = (await headers()).get("host") ?? "localhost";
  return createClient<paths>({ baseUrl: apiBaseUrlForHost(host) });
}

export async function currentTenantHost(): Promise<string> {
  return (await headers()).get("host") ?? "localhost";
}
