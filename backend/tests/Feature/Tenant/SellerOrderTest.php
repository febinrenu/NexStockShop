<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\Customer;
use App\Models\Tenant\Order;
use Illuminate\Support\Str;
use Tests\TenantTestCase;

class SellerOrderTest extends TenantTestCase
{
    public function test_index_requires_tenant_auth(): void
    {
        $response = $this->getJson($this->tenantUrl('/api/v1/seller/orders'));

        $response->assertUnauthorized();
    }

    public function test_index_lists_every_order_in_the_store_not_just_the_callers(): void
    {
        $owner = $this->makeTenantUser('owner');
        $this->makeOrder();
        $this->makeOrder();

        $response = $this->withToken($owner['token'])->getJson($this->tenantUrl('/api/v1/seller/orders'));

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_index_filters_by_status(): void
    {
        $owner = $this->makeTenantUser('owner');
        $this->makeOrder(['status' => 'paid']);
        $this->makeOrder(['status' => 'fulfilled']);

        $response = $this->withToken($owner['token'])->getJson($this->tenantUrl('/api/v1/seller/orders?status=paid'));

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_update_status_validates_the_status_value(): void
    {
        $owner = $this->makeTenantUser('owner');
        $order = $this->makeOrder();

        $response = $this->withToken($owner['token'])
            ->patchJson($this->tenantUrl("/api/v1/seller/orders/{$order->id}/status"), ['status' => 'not-a-status']);

        $response->assertStatus(422);
    }

    public function test_owner_can_transition_an_order_and_it_records_history(): void
    {
        $owner = $this->makeTenantUser('owner');
        $order = $this->makeOrder(['status' => 'paid']);

        $response = $this->withToken($owner['token'])
            ->patchJson($this->tenantUrl("/api/v1/seller/orders/{$order->id}/status"), [
                'status' => 'fulfilled',
                'note' => 'Shipped via courier.',
            ]);

        $response->assertOk();
        $this->assertSame('fulfilled', $response->json('status'));
        $this->assertCount(1, $response->json('status_history'));

        $this->inTenant(function () use ($order) {
            $this->assertSame('fulfilled', $order->fresh()->status);
        });
    }

    private function makeOrder(array $overrides = []): Order
    {
        return $this->inTenant(function () use ($overrides) {
            $customer = Customer::create([
                'name' => 'Shopper',
                'email' => 'shopper-'.Str::random(8).'@example.com',
                'password' => 'password123',
            ]);

            return Order::create(array_merge([
                'order_number' => 'ORD-'.Str::random(8),
                'customer_id' => $customer->id,
                'status' => 'paid',
                'currency' => 'USD',
                'subtotal_minor' => 1999,
                'total_minor' => 1999,
                'placed_at' => now(),
            ], $overrides));
        });
    }
}
