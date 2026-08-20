# Person C Pending Items Tracker

This document tracks outstanding items, missing APIs, and mock boundaries for the NexStockShop dashboard integrations.

---

## 1. Missing Backend APIs (Person A Dependencies)
The following central and tenant administration endpoints are currently unavailable in the Laravel codebase:

### Tenant Admin (Seller) API Layer
*   **Order Fulfillment Tracking**: Missing patch parameters to update tracking number or shipping provider (status patch `PATCH /seller/orders/{order}/status` only accepts status and note).
*   **Analytics Historical Timelines**: Missing bucketed analytics timeline metrics for visual growth charts.

### Platform Super-Admin API Layer
*   **Platform Billing Logs**: Missing index lists endpoints for subscription billing invoices.
*   **Plan Delete**: Missing plans deletion endpoint.

---

## 2. Features Currently Implemented with Mocks
To maintain full front-end diagnostic utility despite missing APIs, the following operations are mock-implemented:

*   **Order Tracking Persistence**: Tracking carrier metadata updates persist in front-end context state.
*   **Analytics Charts**: Bucketed metrics for historical growth timelines and fulfillment status distribution charts use isolated mock sets.
*   **Platform Invoices**: Invoice log listing grids under `/admin/billing` query local memory.
*   **Onboarding Go-Live Bypass**: Since new databases contain 0 products, the real `/go-live` check will fail. The onboarding wizard displays a clearly labeled "Demo/Development Bypass" option to proceed to the Seller dashboard.

---

## 3. Remaining Frontend / Integration Work (Person C)
*   **Phase 5: AI / LLM Integrations**: Implement the LLM service layer (e.g. Gemini/OpenAI helper prompts) to automate theme generation and write product descriptions. (Awaiting employer confirmation of LLM parameters).

---

## 4. Dependencies Genuinely Blocked (Unresolved)
*   **Subdomain routing setup (Person D)**: Connecting Axios credentials dynamically requires host subdomain header resolution (e.g. `acme.localhost`) on localhost.
*   **Stripe payment webhook verification (Person A/D)**: Platform subscription checkout (`POST /central/billing/subscribe`) returns a Stripe Checkout URL that requires live Stripe configurations.
