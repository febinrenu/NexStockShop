import { describe, expect, it } from "vitest";
import { formatMinor, SUPPORTED_CURRENCIES } from "@/lib/money";

describe("formatMinor", () => {
  it("formats whole-dollar USD amounts", () => {
    expect(formatMinor(2500, "USD", "en")).toBe("$25.00");
  });

  it("formats fractional-cent USD amounts", () => {
    expect(formatMinor(1999, "USD", "en")).toBe("$19.99");
  });

  it("formats zero", () => {
    expect(formatMinor(0, "USD", "en")).toBe("$0.00");
  });

  it("formats a recognized non-USD currency (SAR)", () => {
    const result = formatMinor(10000, "SAR", "en");
    expect(result).toContain("100");
  });

  it("formats CFA without throwing, even though it's not a recognized ISO 4217 code", () => {
    // Modern ICU accepts any well-formed 3-letter currency code and prints
    // it as a literal prefix rather than throwing, so CFA goes through
    // formatMinor's try branch, not its catch fallback. ICU separates the
    // code from the number with a non-breaking space (U+00A0), not a
    // regular space.
    expect(formatMinor(150000, "CFA", "en")).toBe("CFA 1,500.00");
  });

  it("falls back to '<amount> <code>' for a malformed currency code Intl rejects outright", () => {
    // Intl.NumberFormat only throws for codes that aren't 3 letters at all
    // (e.g. "US") — this is the actual case the try/catch in formatMinor
    // exists for.
    expect(formatMinor(150000, "US", "en")).toBe("1500.00 US");
  });

  it("never mistakes minor units for major units", () => {
    // 100 minor units of a 2-decimal currency is 1.00, not 100.00.
    expect(formatMinor(100, "USD", "en")).toBe("$1.00");
  });
});

describe("SUPPORTED_CURRENCIES", () => {
  it("lists exactly the currencies the storefront supports", () => {
    expect(SUPPORTED_CURRENCIES).toEqual(["USD", "SAR", "CFA"]);
  });
});
