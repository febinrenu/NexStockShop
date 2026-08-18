<?php

declare(strict_types=1);

namespace App\Services\Billing;

use App\Contracts\Billing\PaymentGateway;
use App\Contracts\Billing\WebhookEvent;
use App\Models\Central\Plan;
use App\Models\Central\Tenant;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripePaymentGateway implements PaymentGateway
{
    private StripeClient $client;

    public function __construct()
    {
        $this->client = new StripeClient((string) config('services.stripe.secret'));
    }

    public function createCheckoutSession(Tenant $tenant, Plan $plan): array
    {
        $session = $this->client->checkout->sessions->create([
            'mode' => 'subscription',
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($plan->currency),
                    'product_data' => ['name' => "TrippleShop — {$plan->name} plan"],
                    'recurring' => ['interval' => $plan->billing_interval],
                    'unit_amount' => $plan->price_cents,
                ],
                'quantity' => 1,
            ]],
            // Metadata on both the session and the resulting subscription —
            // this is how the webhook handler maps a Stripe event back to
            // our tenant without a second API round-trip.
            'metadata' => ['tenant_id' => $tenant->id, 'plan_id' => (string) $plan->id],
            'subscription_data' => [
                'metadata' => ['tenant_id' => $tenant->id, 'plan_id' => (string) $plan->id],
            ],
            'success_url' => config('app.url').'/billing/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.url').'/billing/cancelled',
        ]);

        return ['id' => $session->id, 'url' => $session->url];
    }

    public function constructWebhookEvent(string $payload, string $signature): WebhookEvent
    {
        try {
            $event = Webhook::constructEvent($payload, $signature, (string) config('services.stripe.webhook_secret'));
        } catch (SignatureVerificationException|\UnexpectedValueException $e) {
            throw new \RuntimeException('Invalid Stripe webhook signature.', previous: $e);
        }

        $object = $event->data->object;

        return match ($event->type) {
            'checkout.session.completed' => new WebhookEvent(
                type: $event->type,
                tenantId: $object->metadata->tenant_id ?? null,
                providerSubscriptionId: $object->subscription ?? null,
                providerInvoiceId: null,
                amountMinor: $object->amount_total ?? null,
                currency: $object->currency ?? null,
            ),
            'invoice.paid', 'invoice.payment_failed' => new WebhookEvent(
                type: $event->type,
                tenantId: $object->parent->subscription_details->metadata->tenant_id ?? null,
                providerSubscriptionId: $object->parent->subscription_details->subscription ?? null,
                providerInvoiceId: $object->id ?? null,
                amountMinor: $object->amount_paid ?? $object->amount_due ?? null,
                currency: $object->currency ?? null,
            ),
            'customer.subscription.deleted' => new WebhookEvent(
                type: $event->type,
                tenantId: $object->metadata->tenant_id ?? null,
                providerSubscriptionId: $object->id ?? null,
                providerInvoiceId: null,
                amountMinor: null,
                currency: null,
            ),
            default => new WebhookEvent($event->type, null, null, null, null, null),
        };
    }
}
