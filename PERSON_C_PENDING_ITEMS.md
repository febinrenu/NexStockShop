# Person C Pending Items Tracker

This document outlines verified pending tasks, missing backend APIs, and external team dependencies for the NexStockShop project from the perspective of Person C (Dashboards & AI Lead).

---

## 1. Missing Backend APIs (Person A Dependencies)
The following endpoints are currently missing from the Laravel API codebase (verified by inspecting `routes/tenant.php`, `routes/central.php`, and `docs/api/openapi.json`):

### Tenant Admin (Seller) API Layer
*   **Product Write Actions**: Missing endpoints for creating (`POST /products`), updating (`PUT /products/{id}`), and deleting (`DELETE /products/{id}`) product items. Currently only public GET catalog reads are available.
*   **Inventory Adjustments**: Missing endpoints to update variant stock levels (e.g. `PATCH /inventory/{variant_id}`).
*   **Order Fulfillment**: Missing admin order list (`GET /orders`) and shipment tracking updates (`PATCH /orders/{order_id}/status`) under the `auth:tenant` guard.
*   **Settings Editor**: Missing write endpoint for updating tenant settings (e.g., `PATCH /settings` or `POST /settings/branding`) to save colors and theme templates.
*   **Analytics reporting**: Missing endpoints to fetch MRR, revenue trends, status distribution, and top product counts.

### Platform Super-Admin API Layer
*   **Tenant Control**: Missing endpoints to list, retrieve details, and modify/deactivate tenant records (`GET/POST/PATCH /central/tenants`).
*   **Subscription Plan CRUD**: Missing endpoints to manage billing tiers (`GET/POST/PUT /central/plans`).

---

## 2. Person C Remaining Tasks
The following tasks are assigned to Person C and will be implemented in subsequent phases:

*   **Phase 3: Tenant Onboarding Wizard**: Build the step-by-step registration Next.js portal pages using the existing backend endpoints (`POST /central/signup`, `/onboarding/{tenant}/theme`, `/onboarding/{tenant}/go-live`).
*   **Phase 4: Platform Super-Admin UI**: Create pages for platform settings (live integration) and review moderation queue (live integration), alongside mock layouts for tenant list and subscription tier controls.
*   **Phase 5: AI / LLM Integrations**: Implement the LLM service layer (e.g. Gemini/OpenAI helper prompts) to automate theme generation and write product descriptions.
*   **Phase 6: API Integration & Testing**: Remove client-side mock overrides and connect all UI controls to the live Laravel endpoints once delivered by Person A. Implement frontend integration tests.

---

## 3. Verified External Team Dependencies
*   **Person A (Backend lead)**: Implement the missing write, update, and statistics APIs listed in Section 1.
*   **Person B (Storefront lead)**: Initialize and build out the customer-facing storefront Next.js application, utilizing the mockup assets and static templates (`themes/` and `nexstock-functioning-site/`) as design criteria.
*   **Person D (Full-stack / DevOps)**: Establish subdomain routing parameters so that tenant dashboard requests correctly identify the tenant via the host headers (e.g. `acme.localhost`).
