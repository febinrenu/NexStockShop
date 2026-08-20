# TrippleShop 2.0 — Backend (Person A)

Multi-tenant SaaS e-commerce backend: tenancy & platform core, three-guard
authentication, the full commerce database schema, and the commerce API.
This is the Person A workstream from the TrippleShop 2.0 project brief —
the contract Persons B (storefront), C (dashboards/AI), and D (payments)
build against.

A full implementation plan (scope, architecture decisions, and the
per-requirement coverage check) lives outside this repo as the
`person_a_implementation_plan.pdf` deliverable; this README documents what
is actually built here, in this codebase.

## Stack

- Laravel 11 (API-only — no Blade storefront views)
- [`stancl/tenancy`](https://tenancyforlaravel.com/) — one MySQL database per tenant
- Laravel Sanctum — token auth, three isolated guards
- `spatie/laravel-permission` — role/permission layer for tenant-admin sub-roles
- `dedoc/scramble` — OpenAPI contract generated from route/request code, committed to `docs/api/openapi.json`
- `stripe/stripe-php` — subscription billing (platform charging tenants), behind a `PaymentGateway` interface
- MySQL 8 / MariaDB

## Architecture in one page

**Two kinds of database.** A single **central** database holds
`tenants`, `domains`, `plans`, `subscriptions`, platform super-admin
users, `platform_settings`, and `moderation_flags`. Every tenant gets its
**own** database — products, orders, customers, everything storefront —
provisioned and migrated automatically when a tenant signs up.

**How a request gets routed to the right database.** An incoming
request's host header is matched against the central `domains` table by
`stancl/tenancy`'s identification middleware. On a match, Laravel's
default DB connection is swapped to that tenant's own database *before*
any controller runs (`DatabaseTenancyBootstrapper`). Every tenant-scoped
Eloquent model then reads/writes through the right database automatically
— no manual `tenant_id` scoping on any query. Central models
(`App\Models\Central\*`) are pinned to the central connection via the
`CentralConnection` trait, so they can never resolve against a tenant
database even from inside a tenant-scoped request.

**Three isolated auth contexts**, all token-based (Sanctum), each with
its own Eloquent provider:

| Guard | Table | Lives in |
|---|---|---|
| `platform` | `users` | central DB |
| `tenant` | `users` | each tenant's own DB |
| `customer` | `customers` | each tenant's own DB |

A token issued under one guard cannot authenticate against another —
`Laravel\Sanctum\Guard::hasValidProvider()` checks the token's owning
model against the guard's configured provider model, so a leaked shopper
token is structurally incapable of hitting a tenant-admin or platform
route. This is asserted directly by
[`tests/Feature/GuardIsolationTest.php`](tests/Feature/GuardIsolationTest.php).
Cross-tenant isolation (tenant A can never see tenant B's data) is
asserted by
[`tests/Feature/TenantIsolationTest.php`](tests/Feature/TenantIsolationTest.php),
which provisions two real throwaway tenant databases and checks the
catalog API by domain.

**Tenant sub-roles.** Within the `tenant` guard, `spatie/laravel-permission`
draws a real distinction between `owner` and `staff` — e.g. only an owner
can invite new staff (`staff.invite` permission), checked via
`$user->can(...)`, not just a cosmetic `role` column. Roles/permissions are
seeded into each tenant's own database by
[`database/seeders/TenantPermissionsSeeder.php`](database/seeders/TenantPermissionsSeeder.php),
run once during signup and idempotent if re-run.

**Localization.** Catalog/content endpoints resolve locale from
`Accept-Language` (or `?lang=` for quick testing), defaulting to English.
Translatable fields (product/category name + description) live in
dedicated `*_translations` tables (locale + field + value per row)
instead of duplicated columns per language.

**Multi-currency.** Prices are a currency code plus a minor-unit integer
amount — never a float — stored per product variant per currency.

**Seller-admin dashboard API.** Beyond the public catalog reads and the
customer-guard "my own orders" endpoints, `auth:tenant` gets a real
management surface: product CRUD (`POST/PUT/DELETE /products`), stock
adjustments (`PATCH /inventory/{variant}`), branding settings
(`PATCH /settings`, gated behind the `settings.manage` permission —
owner-only, same pattern as `staff.invite`), and store-wide order
management + sales analytics under `/seller/...`
(`GET /seller/orders`, `PATCH /seller/orders/{order}/status`,
`GET /seller/analytics/summary`). Seller order management lives under
`/seller/orders` rather than `/orders` because that path is already the
customer guard's "my own orders" endpoint — Laravel can't route the same
method+path to two different guards, so a distinct prefix keeps them
from colliding. Suspending a tenant (see below) isn't cosmetic: the
`EnsureTenantIsActive` middleware blocks *all* of that tenant's API,
storefront included, the moment `status` flips to `suspended`.

**Platform-admin management API.** `auth:platform` can list and
suspend/activate tenants (`GET /central/tenants`,
`PATCH /central/tenants/{tenant}`) and manage subscription plan tiers
(`GET/POST/PUT /central/plans`) — the "tenant list/suspend, plan CRUD"
line from §3 of the Person A plan.

**Billing.** `POST /central/billing/subscribe` creates a Stripe Checkout
session for a tenant/plan pair and an `incomplete` `Subscription` row;
`POST /central/billing/webhook` (called by Stripe, verified by signature —
no guard) advances that subscription through `active`/`past_due`/
`cancelled` and writes `Invoice` rows on `invoice.paid`/`invoice.payment_failed`.
All Stripe SDK usage is isolated behind `App\Contracts\Billing\PaymentGateway`
— `BillingController` never talks to the Stripe SDK directly, which is
what lets [`tests/Feature/Central/BillingTest.php`](tests/Feature/Central/BillingTest.php)
assert the full webhook state-machine (checkout completed → active,
payment failed → past_due, subscription deleted → cancelled) without a
real network call.

**Going live with real Stripe.** The code path is complete and fully
tested against a mocked `PaymentGateway`, but nothing in this repo can
create real Stripe API credentials — that's an operational step, not a
code change. Whoever owns the Stripe account needs to: create a Stripe
account/product if one doesn't exist, set real `STRIPE_SECRET` and
`STRIPE_WEBHOOK_SECRET` values in `.env` (see `.env.example`), and
register `POST /api/v1/central/billing/webhook` as the webhook endpoint
URL in the Stripe dashboard for the events `checkout.session.completed`,
`invoice.paid`, `invoice.payment_failed`, and
`customer.subscription.deleted`.

## Directory layout

```
app/Models/Central/      Tenant, Domain, Plan, Subscription, PlatformAdmin, PlatformSetting, ModerationFlag
app/Models/Tenant/       Everything else — catalog, cart, checkout, orders, customer, reviews, newsletter
app/Http/Controllers/Central/   Signup/onboarding, platform-admin auth, platform settings, moderation queue, tenant management, plans
app/Http/Controllers/Tenant/    Tenant/customer auth, catalog, search, cart, checkout, orders, wishlist, reviews, newsletter, seller-admin CRUD/inventory/orders/analytics
app/Http/Middleware/EnsureTenantIsActive.php  Blocks a suspended tenant's entire API — gives real effect to a platform admin's suspend action
routes/central.php              Central (platform) API — loaded once, host-agnostic prefix /api/v1/central
routes/tenant.php               Tenant API entrypoint — auto-loaded by TenancyServiceProvider with tenancy middleware
routes/tenant/commerce.php      The public/customer commerce endpoint surface, require()'d from routes/tenant.php
routes/tenant/seller.php        The seller-admin (auth:tenant) management surface, require()'d from routes/tenant.php
database/migrations/            Central migrations (tenants, domains, plans, subscriptions, platform_settings, moderation_flags, ...)
database/migrations/tenant/     Tenant migrations (catalog, cart, checkout, orders, customer, newsletter, ...)
docs/api/openapi.json           Committed OpenAPI contract (regenerate with `php artisan scramble:export --path=docs/api/openapi.json`)
docs/api/postman_collection.json  Postman collection generated from the same spec (regenerate with `npm run postman:export`)
database/seeders/TenantPermissionsSeeder.php  owner/staff roles+permissions, run inside each tenant's own DB
tests/TenantTestCase.php        Shared test harness: provisions a real throwaway tenant DB per test
```

## Local setup

```bash
composer install
cp .env.example .env
php artisan key:generate

# Create the central database (name from .env's DB_DATABASE)
mysql -uroot -e "CREATE DATABASE trippleshop_central;"

php artisan migrate --force
php artisan db:seed --force   # platform super-admin + starter plans
```

Sign up a tenant against the running app:

```bash
curl -X POST http://localhost:8000/api/v1/central/signup \
  -H 'Content-Type: application/json' \
  -d '{"business_name":"Acme Jewelers","subdomain":"acme","admin_name":"Jane","admin_email":"jane@acme.test","admin_password":"password123"}'
```

This provisions `acme.localhost`'s own database (migrated automatically)
and creates its first owner account — no manual per-tenant setup step.

## Testing

```bash
vendor/bin/pint --test        # code style
vendor/bin/phpstan analyse    # static analysis (level 5, Larastan)
vendor/bin/phpunit            # full suite, including the two isolation suites above
```

Every migration in this repo has been run against a real MySQL database
before being committed — not just reviewed — which is what caught the
real defects listed in the PR description (a virtual-column routing bug
on custom `tenants` columns, and a config pointing at the base
`stancl/tenancy` model instead of the app's subclass).

## CI

`.github/workflows/tests.yml` runs, on every PR, against a real MySQL
service container: migrations, Pint, Larastan, an OpenAPI-contract
drift check (fails the build if `docs/api/openapi.json` is stale relative
to the actual routes), and the full PHPUnit suite — including both
isolation suites, so a guard or tenant leak fails CI, not code review.

The Postman collection is **not** gated by an automated drift check: the
`openapi2postmanv2` generator embeds random item IDs and randomized
Faker example bodies on every run, so a byte-diff would fail on every PR
even with zero real changes. Regenerate it by hand with
`npm run postman:export` when the OpenAPI spec changes and commit the
result — same source of truth, just not CI-enforced.
