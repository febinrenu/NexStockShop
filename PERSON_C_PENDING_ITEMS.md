# Person C Pending Items Tracker

This document tracks outstanding items, missing APIs, and mock boundaries for the NexStockShop dashboard integrations.

---

## 1. Missing Backend APIs (Person A Dependencies)
The following central and tenant administration endpoints are currently unavailable in the Laravel codebase:

### Tenant Admin (Seller) API Layer
*   **Product Write Actions**: Missing `POST /products`, `PUT /products/{id}`, and `DELETE /products/{id}` endpoints.
*   **Inventory Adjustments**: Missing `PATCH /inventory/{variant_id}` endpoints to modify variant stock count.
*   **Order Fulfillment Console**: Missing `GET /orders` query and `PATCH /orders/{id}/status` transition endpoints under `auth:tenant`.
*   **Settings Branding Persistence**: Missing `PATCH /settings` write endpoints for tenant branding.
*   **Analytics Aggregates**: Missing endpoints to fetch sales metrics and revenue summaries.

### Platform Super-Admin API Layer
*   **Tenant Administration**: Missing `GET/POST/PATCH /central/tenants` endpoints to query and suspend/activate tenants.
*   **Billing Tiers CRUD**: Missing `GET/POST/PUT /central/plans` endpoints to query and update pricing details.

---

## 2. Features Currently Implemented with Mocks
To maintain full front-end diagnostic utility despite missing APIs, the following operations are mock-implemented:

*   **Seller CRUD Mutations**: Product creation, editing, and deactivation are managed inside `seller-service.ts` in-memory mock store.
*   **Inventory Adjustments**: Changing stock quantities writes to local memory.
*   **Order Fulfillment transitions**: Shipping orders and tracking entries persist in-session.
*   **Onboarding Go-Live Bypass**: Since new databases contain 0 products, the real `/go-live` check will fail. The onboarding wizard displays a clearly labeled "Demo/Development Bypass" option to proceed to the Seller dashboard.
*   **Platform tenants, plans, and billing listings**: Managed inside `admin-service.ts` mock databases.

---

## 3. Remaining Frontend / Integration Work (Person C)
*   **Phase 5: AI / LLM Integrations**: Implement the LLM service layer (e.g. Gemini/OpenAI helper prompts) to automate theme generation and write product descriptions.
*   **Phase 6: Live API Integration**: Connect mock layers directly to Laravel controllers and remove mock overrides once endpoints are finalized by Person A.

---

## 4. Dependencies Genuinely Blocked (Unresolved)
*   **Subdomain routing setup (Person D)**: Connecting Axios credentials dynamically requires host subdomain header resolution (e.g. `acme.localhost`) on localhost.
*   **Stripe payment webhook verification (Person A/D)**: Platform subscription checkout (`POST /central/billing/subscribe`) returns a Stripe Checkout URL that requires live Stripe configurations.
