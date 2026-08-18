<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use Tests\TenantTestCase;

class WishlistTest extends TenantTestCase
{
    public function test_wishlist_index_requires_customer_auth(): void
    {
        $this->getJson($this->tenantUrl('/api/v1/wishlist'))->assertUnauthorized();
    }

    public function test_wishlist_index_creates_one_if_missing(): void
    {
        $customer = $this->makeCustomer();

        $response = $this->withToken($customer['token'])->getJson($this->tenantUrl('/api/v1/wishlist'));

        $response->assertOk();
        $this->assertSame('My Wishlist', $response->json('name'));
        $this->assertEmpty($response->json('items'));
    }

    public function test_store_requires_a_valid_variant(): void
    {
        $customer = $this->makeCustomer();

        $response = $this->withToken($customer['token'])
            ->postJson($this->tenantUrl('/api/v1/wishlist'), ['product_variant_id' => 999999]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('product_variant_id');
    }

    public function test_store_adds_an_item(): void
    {
        $seeded = $this->seedProduct();
        $customer = $this->makeCustomer();

        $response = $this->withToken($customer['token'])
            ->postJson($this->tenantUrl('/api/v1/wishlist'), ['product_variant_id' => $seeded['variant']->id]);

        $response->assertCreated();
        $this->assertCount(1, $response->json('items'));
    }

    public function test_destroy_removes_an_item(): void
    {
        $seeded = $this->seedProduct();
        $customer = $this->makeCustomer();

        $add = $this->withToken($customer['token'])
            ->postJson($this->tenantUrl('/api/v1/wishlist'), ['product_variant_id' => $seeded['variant']->id]);
        $itemId = $add->json('items.0.id');

        $response = $this->withToken($customer['token'])
            ->deleteJson($this->tenantUrl("/api/v1/wishlist/{$itemId}"));

        $response->assertOk();

        $after = $this->withToken($customer['token'])->getJson($this->tenantUrl('/api/v1/wishlist'));
        $this->assertEmpty($after->json('items'));
    }
}
