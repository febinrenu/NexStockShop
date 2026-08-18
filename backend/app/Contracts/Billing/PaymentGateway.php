<?php

declare(strict_types=1);

namespace App\Contracts\Billing;

use App\Models\Central\Plan;
use App\Models\Central\Tenant;

/**
 * Person A owns subscription billing (platform charging tenants) —
 * §2.5 of the implementation plan. Kept behind this interface so
 * BillingController is testable without a real network call to Stripe:
 * tests bind a Mockery double here instead of hitting the real API.
 */
interface PaymentGateway
{
    /**
     * @return array{id: string, url: string} the provider's checkout
     *                                        session id and the URL to redirect the tenant owner to
     */
    public function createCheckoutSession(Tenant $tenant, Plan $plan): array;

    /**
     * @throws \RuntimeException if the signature doesn't verify
     */
    public function constructWebhookEvent(string $payload, string $signature): WebhookEvent;
}
