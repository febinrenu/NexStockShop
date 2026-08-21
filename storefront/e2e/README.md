# E2E tests

These Playwright specs drive the storefront against a real running
Person A backend and a seeded tenant — they are integration tests, not
hermetic unit tests, and will fail with connection errors if the
prerequisites below aren't running.

## Prerequisites

1. **Backend running** on `http://localhost:8000` (`php artisan serve` from
   the `backend/` folder, against a migrated + seeded database).
2. **A tenant seeded** with:
   - domain `aurum-demo.localhost`
   - store name `Aurum Jewelers`
   - `branding.theme = "aurumeclat"`
   - `default_currency = "USD"`
   - at least one in-stock product with a default variant
3. **`aurum-demo.localhost` resolvable to `127.0.0.1`.** Browsers resolve
   `*.localhost` automatically, but if you hit connection errors, add to
   `/etc/hosts`:
   ```
   127.0.0.1 aurum-demo.localhost
   ```
4. **Storefront's `.env.local`** pointing at the backend:
   ```
   NEXT_PUBLIC_API_SCHEME=http
   NEXT_PUBLIC_API_PORT=8000
   NEXT_PUBLIC_CENTRAL_HOST=localhost
   ```
5. **Next dev server running** on port 3000 (`npm run dev`).

## Running

```bash
npm run test:e2e
```

`playwright.config.ts` targets `http://aurum-demo.localhost:3000` by
default; override with `PLAYWRIGHT_BASE_URL` to point at a different tenant
or port.

## What's covered

- `checkout-flow.spec.ts` — the full guest path manually verified during
  development: home → shop → product detail → add to cart → cart →
  checkout (address → shipping → payment → confirmation) → real order
  number from the backend.
- `rtl-locale.spec.ts` — the Arabic locale renders `dir="rtl"` and uses
  real Arabic copy (`messages/ar.json`), not the English fallback.

These two flows caught real bugs during manual testing (a CSS
cascade/specificity bug that silently overrode every theme's colors, and a
checkout-confirmation screen masked by an empty-cart guard) that
`tsc`/`eslint`/`next build` did not — that's the reason they're codified
here instead of left as one-off manual checks.
