import "server-only";
import { serverApiClient } from "./api/server";

/**
 * Matches TenantSettingsController@show's actual response exactly.
 * Hand-declared rather than derived from schema.ts: Scramble couldn't
 * infer field types from `response()->json([...])` with values pulled
 * off the tenant() helper, so the generated type has every field as
 * `unknown` (same limitation as CartItem/customer — see raw-types.ts).
 */
export interface TenantSettings {
  name: string | null;
  branding: {
    logo_url: string | null;
    theme: string | null;
    primary_color: string | null;
  };
  default_locale: string | null;
  default_currency: string | null;
}

const FALLBACK: TenantSettings = {
  name: null,
  branding: { logo_url: null, theme: "futurex", primary_color: null },
  default_locale: "en",
  default_currency: "USD",
};

/**
 * GET /v1/settings, resolved fresh per request against whichever tenant
 * host the request came in on. Falls back to a neutral theme rather than
 * throwing — a storefront should never hard-crash just because branding
 * lookup failed once (e.g. backend briefly unreachable).
 */
export async function getTenantSettings(): Promise<TenantSettings> {
  try {
    const client = await serverApiClient();
    const { data, error } = await client.GET("/v1/settings");
    if (error || !data) return FALLBACK;
    return data as unknown as TenantSettings;
  } catch {
    return FALLBACK;
  }
}
