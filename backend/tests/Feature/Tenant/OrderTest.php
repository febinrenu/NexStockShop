<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\Order;
use Tests\TenantTestCase;

class OrderTest extends TenantTestCase
{
    public function test_orders_index_requires_customer_auth(): void
    {
        $response = $this->getJson($this->tenantUrl('/api/v1/orders'));

        $response->assertUnauthorized();
    }

    public function test_orders_index_lists_only_the_authenticated_customers_orders(): void
    {
        $seeded = $this->seedProduct();
        $customer = $this->makeCustomer();
        $otherCustomer = $this->makeCustomer();

        $this->inTenant(function () use ($customer, $otherCustomer) {
            Order::create([
                'order_number' => 'ORD-MINE',
                'customer_id' => $customer['customer']->id,
                'status' => 'paid',
                'currency' => 'USD',
                'subtotal_minor' => 2500,
                'total_minor' => 2500,
                'placed_at' => now(),
            ]);
            Order::create([
                'order_number' => 'ORD-OTHER',
                'customer_id' => $otherCustomer['customer']->id,
                'status' => 'paid',
                'currency' => 'USD',
                'subtotal_minor' => 2500,
                'total_minor' => 2500,
                'placed_at' => now(),
            ]);
        });

        $response = $this->withToken($customer['token'])->getJson($this->tenantUrl('/api/v1/orders'));

        $response->assertOk();
        $numbers = collect($response->json('data'))->pluck('order_number');
        $this->assertTrue($numbers->contains('ORD-MINE'));
        $this->assertFalse($numbers->contains('ORD-OTHER'));
    }

    public function test_show_rejects_another_customers_order(): void
    {
        $customer = $this->makeCustomer();
        $otherCustomer = $this->makeCustomer();

        $orderId = $this->inTenant(function () use ($otherCustomer) {
            return Order::create([
                'order_number' => 'ORD-NOT-MINE',
                'customer_id' => $otherCustomer['customer']->id,
                'status' => 'paid',
                'currency' => 'USD',
                'subtotal_minor' => 2500,
                'total_minor' => 2500,
                'placed_at' => now(),
            ])->id;
        });

        $response = $this->withToken($customer['token'])->getJson($this->tenantUrl("/api/v1/orders/{$orderId}"));

        $response->assertForbidden();
    }

    public function test_tracking_returns_status_history(): void
    {
        $customer = $this->makeCustomer();

        $orderId = $this->inTenant(function () use ($customer) {
            $order = Order::create([
                'order_number' => 'ORD-TRACK',
                'customer_id' => $customer['customer']->id,
                'status' => 'paid',
                'currency' => 'USD',
                'subtotal_minor' => 2500,
                'total_minor' => 2500,
                'placed_at' => now(),
            ]);
            $order->recordStatus('paid', 'Order placed and paid.');

            return $order->id;
        });

        $response = $this->withToken($customer['token'])->getJson($this->tenantUrl("/api/v1/orders/{$orderId}/tracking"));

        $response->assertOk();
        $this->assertSame('ORD-TRACK', $response->json('order_number'));
        $this->assertNotEmpty($response->json('history'));
    }
}
