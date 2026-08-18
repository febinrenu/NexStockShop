<?php

declare(strict_types=1);

namespace App\Http\Controllers\Central;

use App\Contracts\Billing\PaymentGateway;
use App\Contracts\Billing\WebhookEvent;
use App\Http\Controllers\Controller;
use App\Models\Central\Invoice;
use App\Models\Central\Plan;
use App\Models\Central\Subscription;
use App\Models\Central\Tenant;
use Illuminate\Http\Request;

/**
 * Subscription billing (platform charging tenants) — §2.5 of the Person A
 * plan. Person D owns checkout *payment* integration (shoppers paying
 * tenants); this controller is the other side of that split.
 */
class BillingController extends Controller
{
    public function __construct(private readonly PaymentGateway $gateway) {}

    public function subscribe(Request $request)
    {
        $data = $request->validate([
            'tenant_id' => ['required', 'string', 'exists:tenants,id'],
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
        ]);

        $tenant = Tenant::findOrFail($data['tenant_id']);
        $plan = Plan::findOrFail($data['plan_id']);

        $session = $this->gateway->createCheckoutSession($tenant, $plan);

        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'incomplete',
            'provider_subscription_id' => $session['id'],
        ]);

        return response()->json(['checkout_url' => $session['url']]);
    }

    public function webhook(Request $request)
    {
        try {
            $event = $this->gateway->constructWebhookEvent(
                $request->getContent(),
                $request->header('Stripe-Signature', ''),
            );
        } catch (\RuntimeException) {
            return response()->json(['message' => 'Invalid webhook signature.'], 400);
        }

        match ($event->type) {
            'checkout.session.completed' => $this->activateSubscription($event),
            'invoice.paid' => $this->recordInvoice($event, 'paid'),
            'invoice.payment_failed' => $this->recordInvoice($event, 'failed'),
            'customer.subscription.deleted' => $this->cancelSubscription($event),
            default => null,
        };

        return response()->json(['received' => true]);
    }

    private function activateSubscription(WebhookEvent $event): void
    {
        if (! $event->tenantId) {
            return;
        }

        Subscription::where('tenant_id', $event->tenantId)
            ->where('status', 'incomplete')
            ->latest('id')
            ->first()
            ?->update([
                'status' => 'active',
                'provider_subscription_id' => $event->providerSubscriptionId,
                'current_period_ends_at' => now()->addMonth(),
            ]);
    }

    private function recordInvoice(WebhookEvent $event, string $status): void
    {
        $subscription = Subscription::where('provider_subscription_id', $event->providerSubscriptionId)->first();

        if (! $subscription) {
            return;
        }

        Invoice::updateOrCreate(
            ['provider_invoice_id' => $event->providerInvoiceId],
            [
                'subscription_id' => $subscription->id,
                'tenant_id' => $subscription->tenant_id,
                'amount_minor' => $event->amountMinor ?? 0,
                'currency' => strtoupper($event->currency ?? $subscription->plan->currency),
                'status' => $status,
                'issued_at' => now(),
                'paid_at' => $status === 'paid' ? now() : null,
            ],
        );

        if ($status === 'failed') {
            $subscription->update(['status' => 'past_due']);
        }
    }

    private function cancelSubscription(WebhookEvent $event): void
    {
        Subscription::where('provider_subscription_id', $event->providerSubscriptionId)
            ->update(['status' => 'cancelled', 'cancelled_at' => now()]);
    }
}
