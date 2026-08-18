<?php

declare(strict_types=1);

namespace Tests\Feature\Central;

use App\Contracts\Billing\PaymentGateway;
use App\Contracts\Billing\WebhookEvent;
use App\Models\Central\Invoice;
use App\Models\Central\Plan;
use App\Models\Central\Subscription;
use App\Models\Central\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * The real Stripe API is never called here — PaymentGateway is bound to a
 * Mockery double for every test, so these prove BillingController's own
 * logic (what it does with a checkout session / webhook event), not
 * Stripe's behavior.
 */
class BillingTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscribe_validates_tenant_and_plan(): void
    {
        // Bare mock: Laravel resolves BillingController's constructor
        // dependencies (including PaymentGateway) before the method body
        // — and therefore before $request->validate() — runs, so this
        // needs a working double even though it's never actually called.
        $this->mock(PaymentGateway::class);

        $response = $this->postJson('/api/v1/central/billing/subscribe', ['tenant_id' => 'nope', 'plan_id' => 999]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['tenant_id', 'plan_id']);
    }

    public function test_subscribe_creates_an_incomplete_subscription_and_returns_a_checkout_url(): void
    {
        $tenant = $this->makeTenant();
        $plan = Plan::create($this->planAttributes());

        $this->mock(PaymentGateway::class, function ($mock) {
            $mock->shouldReceive('createCheckoutSession')
                ->once()
                ->andReturn(['id' => 'cs_test_123', 'url' => 'https://checkout.stripe.com/test123']);
        });

        $response = $this->postJson('/api/v1/central/billing/subscribe', [
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
        ]);

        $response->assertOk();
        $this->assertSame('https://checkout.stripe.com/test123', $response->json('checkout_url'));

        $subscription = Subscription::where('tenant_id', $tenant->id)->first();
        $this->assertSame('incomplete', $subscription->status);
        $this->assertSame('cs_test_123', $subscription->provider_subscription_id);
    }

    public function test_webhook_rejects_an_invalid_signature(): void
    {
        $this->mock(PaymentGateway::class, function ($mock) {
            $mock->shouldReceive('constructWebhookEvent')->once()->andThrow(new \RuntimeException('bad signature'));
        });

        $response = $this->postJson('/api/v1/central/billing/webhook', [], ['Stripe-Signature' => 'garbage']);

        $response->assertStatus(400);
    }

    public function test_checkout_completed_activates_the_pending_subscription(): void
    {
        $tenant = $this->makeTenant();
        $plan = Plan::create($this->planAttributes());
        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'incomplete',
            'provider_subscription_id' => 'cs_test_123',
        ]);

        $this->mock(PaymentGateway::class, function ($mock) use ($tenant) {
            $mock->shouldReceive('constructWebhookEvent')->once()->andReturn(new WebhookEvent(
                type: 'checkout.session.completed',
                tenantId: $tenant->id,
                providerSubscriptionId: 'sub_real_123',
                providerInvoiceId: null,
                amountMinor: 2900,
                currency: 'usd',
            ));
        });

        $response = $this->postJson('/api/v1/central/billing/webhook');

        $response->assertOk();

        $subscription = Subscription::where('tenant_id', $tenant->id)->first();
        $this->assertSame('active', $subscription->status);
        $this->assertSame('sub_real_123', $subscription->provider_subscription_id);
        $this->assertNotNull($subscription->current_period_ends_at);
    }

    public function test_invoice_paid_creates_a_paid_invoice(): void
    {
        $tenant = $this->makeTenant();
        $plan = Plan::create($this->planAttributes());
        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'provider_subscription_id' => 'sub_real_123',
        ]);

        $this->mock(PaymentGateway::class, function ($mock) use ($tenant) {
            $mock->shouldReceive('constructWebhookEvent')->once()->andReturn(new WebhookEvent(
                type: 'invoice.paid',
                tenantId: $tenant->id,
                providerSubscriptionId: 'sub_real_123',
                providerInvoiceId: 'in_test_1',
                amountMinor: 2900,
                currency: 'usd',
            ));
        });

        $response = $this->postJson('/api/v1/central/billing/webhook');

        $response->assertOk();

        $invoice = Invoice::where('provider_invoice_id', 'in_test_1')->first();
        $this->assertNotNull($invoice);
        $this->assertSame('paid', $invoice->status);
        $this->assertSame(2900, $invoice->amount_minor);
        $this->assertSame('USD', $invoice->currency);
        $this->assertSame($subscription->id, $invoice->subscription_id);
    }

    public function test_invoice_payment_failed_marks_subscription_past_due(): void
    {
        $tenant = $this->makeTenant();
        $plan = Plan::create($this->planAttributes());
        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'provider_subscription_id' => 'sub_real_123',
        ]);

        $this->mock(PaymentGateway::class, function ($mock) use ($tenant) {
            $mock->shouldReceive('constructWebhookEvent')->once()->andReturn(new WebhookEvent(
                type: 'invoice.payment_failed',
                tenantId: $tenant->id,
                providerSubscriptionId: 'sub_real_123',
                providerInvoiceId: 'in_test_2',
                amountMinor: 2900,
                currency: 'usd',
            ));
        });

        $this->postJson('/api/v1/central/billing/webhook')->assertOk();

        $subscription = Subscription::where('tenant_id', $tenant->id)->first();
        $this->assertSame('past_due', $subscription->status);

        $invoice = Invoice::where('provider_invoice_id', 'in_test_2')->first();
        $this->assertSame('failed', $invoice->status);
    }

    public function test_subscription_deleted_cancels_the_subscription(): void
    {
        $tenant = $this->makeTenant();
        $plan = Plan::create($this->planAttributes());
        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'provider_subscription_id' => 'sub_real_123',
        ]);

        $this->mock(PaymentGateway::class, function ($mock) {
            $mock->shouldReceive('constructWebhookEvent')->once()->andReturn(new WebhookEvent(
                type: 'customer.subscription.deleted',
                tenantId: null,
                providerSubscriptionId: 'sub_real_123',
                providerInvoiceId: null,
                amountMinor: null,
                currency: null,
            ));
        });

        $this->postJson('/api/v1/central/billing/webhook')->assertOk();

        $subscription = Subscription::where('tenant_id', $tenant->id)->first();
        $this->assertSame('cancelled', $subscription->status);
        $this->assertNotNull($subscription->cancelled_at);
    }

    private function makeTenant(): Tenant
    {
        return Tenant::create(['id' => (string) Str::uuid(), 'name' => 'Acme', 'status' => 'active']);
    }

    private function planAttributes(): array
    {
        return [
            'name' => 'Growth',
            'slug' => 'growth-'.Str::random(6),
            'price_cents' => 2900,
            'currency' => 'USD',
            'billing_interval' => 'month',
        ];
    }
}
