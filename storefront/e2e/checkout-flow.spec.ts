import { test, expect } from "@playwright/test";

// Codifies the guest end-to-end flow that was manually verified in a live
// browser against the seeded "Aurum Jewelers" tenant (aurumeclat theme)
// before this suite existed: home -> shop -> product detail -> add to cart
// -> cart -> checkout (all 4 steps) -> confirmation with a real order
// number from the backend. Requires a running Laravel backend + Next dev
// server on aurum-demo.localhost (see e2e/README.md) — it is not hermetic.

test.describe("guest checkout", () => {
  test("home page renders tenant branding and theme", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "aurumeclat");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("link", { name: "Aurum Jewelers" })).toBeVisible();
  });

  test("full guest flow: home -> shop -> product -> cart -> checkout -> order confirmation", async ({ page }) => {
    await page.goto("/en");

    await page.getByRole("link", { name: "Shop", exact: true }).first().click();
    await expect(page).toHaveURL(/\/en\/shop/);

    const firstProduct = page.locator("main a[href*='/products/']").first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/en\/products\//);

    await page.getByRole("button", { name: "Add to Cart" }).click();

    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page).toHaveURL(/\/en\/cart/);
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
    await expect(page.getByText("Subtotal")).toBeVisible();

    await page.getByRole("link", { name: "Proceed to Checkout" }).click();
    await expect(page).toHaveURL(/\/en\/checkout/);

    // Step 1: address (guest — filled inline, not saved to an account)
    await expect(page.getByText("Shipping Address")).toBeVisible();
    await page.getByPlaceholder("Full Name").fill("Jane Shopper");
    await page.getByPlaceholder("Address Line 1").fill("42 Nile Street");
    await page.getByPlaceholder("City").fill("Accra");
    await page.getByPlaceholder("Country").fill("GH");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2: shipping method (Standard preselected)
    await expect(page.getByText("Shipping Method")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3: payment
    await expect(page.getByText("Payment Method")).toBeVisible();
    await page.getByRole("button", { name: "Place Order" }).click();

    // Step 4: confirmation — must show the placed-order state, not the
    // empty-cart guard (see the fixed step !== "confirm" bug in
    // src/app/[locale]/checkout/page.tsx).
    await expect(page.getByText("Order placed!")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Order number: ORD-/)).toBeVisible();
  });
});
