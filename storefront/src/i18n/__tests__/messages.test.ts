import { describe, expect, it } from "vitest";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";

// next-intl silently renders a missing-key placeholder instead of failing
// the build, so a key present in one locale but not the other would only
// ever be caught by someone manually clicking through the Arabic UI. This
// suite makes that a CI failure instead.

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    flattenKeys(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe("messages/en.json vs messages/ar.json", () => {
  const enKeys = flattenKeys(en).sort();
  const arKeys = flattenKeys(ar).sort();

  it("have identical key sets", () => {
    const missingFromAr = enKeys.filter((k) => !arKeys.includes(k));
    const missingFromEn = arKeys.filter((k) => !enKeys.includes(k));
    expect(missingFromAr, "keys present in en.json but missing from ar.json").toEqual([]);
    expect(missingFromEn, "keys present in ar.json but missing from en.json").toEqual([]);
  });

  it("has no empty string values in either locale", () => {
    for (const [locale, keys, obj] of [
      ["en", enKeys, en] as const,
      ["ar", arKeys, ar] as const,
    ]) {
      for (const key of keys) {
        const value = key.split(".").reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], obj);
        expect(value, `${locale}.${key} is empty`).not.toBe("");
      }
    }
  });

  it("ar.json values are not just copies of the English text (real translation, not placeholder)", () => {
    // A handful of short strings can legitimately be identical (e.g. brand
    // names or numerals), so only flag values long enough that an
    // untranslated placeholder would be suspicious.
    const suspiciouslyUntranslated = enKeys.filter((key) => {
      const enValue = key.split(".").reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], en);
      const arValue = key.split(".").reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], ar);
      return typeof enValue === "string" && enValue.length > 12 && enValue === arValue;
    });
    expect(suspiciouslyUntranslated).toEqual([]);
  });
});
