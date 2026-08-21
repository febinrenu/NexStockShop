import { test, expect } from "@playwright/test";

// Codifies the Arabic/RTL manual verification pass: /ar renders with
// dir="rtl", the layout mirrors, and copy is real Arabic translation
// rather than the English fallback or an untranslated placeholder.

test.describe("Arabic locale", () => {
  test("renders RTL direction and translated nav", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    // messages/ar.json nav.shop — scoped to the header since the footer
    // also links to the shop with the same translated label.
    await expect(page.getByRole("banner").getByRole("link", { name: "المتجر" })).toBeVisible();
  });

  test("shop page renders in Arabic with RTL layout", async ({ page }) => {
    await page.goto("/ar/shop");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    // messages/ar.json shop.title
    await expect(page.getByRole("heading", { name: "المتجر" })).toBeVisible();
  });
});
