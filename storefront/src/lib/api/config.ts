/**
 * How this storefront finds "its" tenant's API.
 *
 * Person A's backend (see backend/README.md, §2.3) resolves a tenant by
 * matching the raw HTTP Host header of the request that reaches Laravel
 * against that tenant's registered domain — there is no tenant-ID header
 * or query param to pass instead. So this app calls the API directly on
 * that same subdomain (e.g. https://acme.trippleshop.com/api/v1/...)
 * rather than proxying through its own server, which would strip the
 * tenant's Host header and break resolution.
 *
 * NEXT_PUBLIC_API_SCHEME + NEXT_PUBLIC_API_PORT let this work locally
 * (http, :8000, matching `php artisan serve`) without any code change for
 * production (https, no port) — actual DNS/reverse-proxy wiring for
 * production is Person D's tenant-provisioning/deployment scope, not
 * this app's.
 */

const API_SCHEME = process.env.NEXT_PUBLIC_API_SCHEME || "http";
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || "8000";
const CENTRAL_HOST = process.env.NEXT_PUBLIC_CENTRAL_HOST || "localhost";

function withPort(host: string): string {
  const bareHost = host.split(":")[0];
  return API_PORT ? `${bareHost}:${API_PORT}` : bareHost;
}

/** Strips the Next.js app's own port so we're left with just the hostname
 *  (e.g. "acme.localhost:3000" -> "acme.localhost"), then re-applies the
 *  API's own port. */
export function apiBaseUrlForHost(requestHost: string): string {
  return `${API_SCHEME}://${withPort(requestHost)}/api`;
}

/** Central (platform-level, not tenant-scoped) API base — signup, plans. */
export function centralApiBaseUrl(): string {
  return `${API_SCHEME}://${withPort(CENTRAL_HOST)}/api`;
}

/** Client-side: derive from the browser's own current host. */
export function clientApiBaseUrl(): string {
  if (typeof window === "undefined") {
    throw new Error("clientApiBaseUrl() called outside the browser");
  }
  return apiBaseUrlForHost(window.location.host);
}
