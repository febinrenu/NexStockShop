import { defineConfig, devices } from "@playwright/test";

// These specs exercise the storefront against a real running tenant on the
// Laravel backend (aurum-demo.localhost, theme "aurumeclat", seeded via
// JewelryDemoDataSeeder-equivalent tenant fixtures) — the same seeded
// tenant used for the manual live-browser verification pass. They are not
// hermetic unit tests: PLAYWRIGHT_BASE_URL / a running backend at
// aurum-demo.localhost:8000 and Next dev server at aurum-demo.localhost:3000
// are required (see e2e/README.md).
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://aurum-demo.localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // This sandbox pre-installs Chromium at a fixed path and skips
        // Playwright's own browser download (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD) —
        // the default headless-shell binary Playwright expects isn't present,
        // so point launches at the real Chromium binary instead.
        launchOptions: { executablePath: "/opt/pw-browsers/chromium" },
      },
    },
  ],
});
