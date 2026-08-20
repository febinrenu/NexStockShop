<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\Customer;
use App\Models\Tenant\Order;
use App\Models\Tenant\OrderItem;
use Illuminate\Support\Str;
use Tests\TenantTestCase;

class SellerAnalyticsTest extends TenantTestCase
{
    public function test_summary_requires_tenant_auth(): void
    {
        $response = $this->getJson($this->tenantUrl('/api/v1/seller/analytics/summary'));

        $response->assertUnauthorized();
    }

    public function test_summary_aggregates_revenue_by_currency_and_excludes_cancelled_orders(): void
    {
        $owner = $this->makeTenantUser('owner');
        $this->makeOrderWithItem(['status' => 'paid', 'currency' => 'USD', 'total_minor' => 2000]);
        $this->makeOrderWithItem(['status' => 'paid', 'currency' => 'USD', 'total_minor' => 3000]);
        $this->makeOrderWithItem(['status' => 'cancelled', 'currency' => 'USD', 'total_minor' => 9999]);

        $response = $this->withToken($owner['token'])->getJson($this->tenantUrl('/api/v1/seller/analytics/summary'));

        $response->assertOk();
        $this->assertSame(2, $response->json('orders_count'));

        $usd = collect($response->json('revenue_by_currency'))->firstWhere('currency', 'USD');
        $this->assertSame(5000, $usd['amount_minor']);
        $this->assertCount(1, $response->json('top_products'));
    }

    private function makeOrderWithItem(array $overrides = []): Order
    {
        return $this->inTenant(function () use ($overrides) {
            $customer = Customer::create([
                'name' => 'Shopper',
                'email' => 'shopper-'.Str::random(8).'@example.com',
                'password' => 'password123',
            ]);

            $order = Order::create(array_merge([
                'order_number' => 'ORD-'.Str::random(8),
                'customer_id' => $customer->id,
                'status' => 'paid',
                'currency' => 'USD',
                'subtotal_minor' => 2000,
                'total_minor' => 2000,
                'placed_at' => now(),
            ], $overrides));

            OrderItem::create([
                'order_id' => $order->id,
                'product_name' => 'Test Product',
                'sku' => 'SKU-1',
                'quantity' => 1,
                'unit_price_minor' => $order->total_minor,
                'line_total_minor' => $order->total_minor,
            ]);

            return $order;
        });
    }
}
