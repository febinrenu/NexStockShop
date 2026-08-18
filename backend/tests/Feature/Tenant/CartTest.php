<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\Cart;
use Tests\TenantTestCase;

class CartTest extends TenantTestCase
{
    public function test_guest_cart_is_created_on_first_view(): void
    {
        $response = $this->getJson($this->tenantUrl('/api/v1/cart'));

        $response->assertOk();
        $this->assertSame(0, $response->json('subtotal_minor'));
    }

    public function test_add_item_requires_valid_variant_and_quantity(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/cart/items'), [
            'product_variant_id' => 999999,
            'quantity' => 0,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['product_variant_id', 'quantity']);
    }

    public function test_add_item_creates_a_guest_cart_and_returns_subtotal(): void
    {
        $seeded = $this->seedProduct();

        $response = $this->postJson($this->tenantUrl('/api/v1/cart/items'), [
            'product_variant_id' => $seeded['variant']->id,
            'quantity' => 2,
        ]);

        $response->assertOk();
        $this->assertSame(5000, $response->json('subtotal_minor')); // 2 * 2500
        $this->assertCount(1, $response->json('items'));
    }

    public function test_adding_same_variant_twice_increments_quantity_not_duplicates_row(): void
    {
        $seeded = $this->seedProduct();

        $first = $this->postJson($this->tenantUrl('/api/v1/cart/items'), [
            'product_variant_id' => $seeded['variant']->id,
            'quantity' => 1,
        ]);
        $first->assertOk();
        $guestToken = $first->json('guest_token');

        $response = $this->withHeaders(['X-Guest-Token' => $guestToken])
            ->postJson($this->tenantUrl('/api/v1/cart/items'), [
                'product_variant_id' => $seeded['variant']->id,
                'quantity' => 1,
            ]);

        $response->assertOk();
        $this->assertCount(1, $response->json('items'));
        $this->assertSame(5000, $response->json('subtotal_minor'));
    }

    public function test_authenticated_customer_cart_is_stored_against_the_customer_id(): void
    {
        $seeded = $this->seedProduct();
        $customer = $this->makeCustomer();

        $this->withToken($customer['token'])
            ->postJson($this->tenantUrl('/api/v1/cart/items'), [
                'product_variant_id' => $seeded['variant']->id,
                'quantity' => 1,
            ])->assertOk();

        // Asserted directly against the DB rather than via a second,
        // supposedly-unauthenticated HTTP call: Laravel's test HTTP client
        // reuses one application container across calls within a test, and
        // Sanctum's RequestGuard caches its resolved user for the
        // container's lifetime, so a later "guest" call in the same test
        // would still see the earlier customer regardless of headers —
        // a test-client artifact, not something that happens across real
        // per-process requests in production.
        $this->inTenant(function () use ($customer) {
            $cart = Cart::where('customer_id', $customer['customer']->id)->first();
            $this->assertNotNull($cart);
            $this->assertSame(2500, $cart->subtotalMinor());
        });
    }

    public function test_clear_cart_empties_items(): void
    {
        $seeded = $this->seedProduct();
        $add = $this->postJson($this->tenantUrl('/api/v1/cart/items'), [
            'product_variant_id' => $seeded['variant']->id,
            'quantity' => 1,
        ]);
        $guestToken = $add->json('guest_token');

        $this->withHeaders(['X-Guest-Token' => $guestToken])
            ->deleteJson($this->tenantUrl('/api/v1/cart'))
            ->assertOk();

        $after = $this->withHeaders(['X-Guest-Token' => $guestToken])
            ->getJson($this->tenantUrl('/api/v1/cart'));

        $this->assertSame(0, $after->json('subtotal_minor'));
    }
}
