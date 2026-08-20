import { defineRouting } from "next-intl/routing";

/**
 * English + Arabic minimum, per the Person A/brief's "bilingual
 * English/Arabic support... a hard requirement, not a stretch goal"
 * (every NexStock mockup ships both). Locale prefix is always present
 * (/en/..., /ar/...) so a shared link never silently assumes a default.
 */
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
});

export const RTL_LOCALES = ["ar"];

export function directionFor(locale: string): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/** The locale code this app's active locale should send to Person A's
 *  API as Accept-Language / ?lang= — see backend's Localization::resolve. */
export function apiLocaleFor(locale: string): string {
  return locale;
}
