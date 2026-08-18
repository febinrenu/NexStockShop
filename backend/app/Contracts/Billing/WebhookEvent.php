<?php

declare(strict_types=1);

namespace App\Contracts\Billing;

/**
 * Normalized shape a PaymentGateway hands back after verifying a webhook
 * payload — BillingController never touches the raw Stripe (or other
 * provider's) event structure directly.
 */
final class WebhookEvent
{
    public function __construct(
        public readonly string $type,
        public readonly ?string $tenantId,
        public readonly ?string $providerSubscriptionId,
        public readonly ?string $providerInvoiceId,
        public readonly ?int $amountMinor,
        public readonly ?string $currency,
    ) {}
}
