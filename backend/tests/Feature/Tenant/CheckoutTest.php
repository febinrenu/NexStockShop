<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\Cart;
use Tests\TenantTestCase;

class CheckoutTest extends TenantTestCase
{
    public function test_create_session_requires_a_valid_cart_id(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/checkout/session'), ['cart_id' => 999999]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('cart_id');
    }

    public function test_create_session_from_a_real_cart(): void
    {
        $seeded = $this->seedProduct();
        $addResponse = $this->postJson($this->tenantUrl('/api/v1/cart/items'), [
            'product_variant_id' => $seeded['variant']->id,
            'quantity' => 1,
        ]);
        $cartId = $addResponse->json('id');

        $response = $this->postJson($this->tenantUrl('/api/v1/checkout/session'), ['cart_id' => $cartId]);

        $response->assertOk();
        $this->assertSame('started', $response->json('status'));
        $this->assertSame(2500, $response->json('totals.subtotal_minor'));
    }

    public function test_update_session_returns_404_for_missing_session(): void
    {
        $response = $this->patchJson($this->tenantUrl('/api/v1/checkout/session/999999'), ['status' => 'address']);

        $response->assertNotFound();
    }

    public function test_complete_rejects_an_empty_cart(): void
    {
        $seeded = $this->seedProduct();
        $addResponse = $this->postJson($this->tenantUrl('/api/v1/cart/items'), [
            'product_variant_id' => $seeded['variant']->id,
            'quantity' => 1,
        ]);
        $guestToken = $addResponse->json('guest_token');
        $cartId = $addResponse->json('id');

        $sessionResponse = $this->postJson($this->tenantUrl('/api/v1/checkout/session'), ['cart_id' => $cartId]);
        $sessionId = $sessionResponse->json('id');

        // Empty the cart before completing checkout.
        $this->withHeaders(['X-Guest-Token' => $guestToken])
            ->deleteJson($this->tenantUrl('/api/v1/cart'));

        $response = $this->postJson($this->tenantUrl("/api/v1/checkout/session/{$sessionId}/complete"));

        $response->assertStatus(422);
    }

    public function test_complete_creates_an_order_and_converts_the_cart(): void
    {
        $seeded = $this->seedProduct();
        $addResponse = $this->postJson($this->tenantUrl('/api/v1/cart/items'), [
            'product_variant_id' => $seeded['variant']->id,
            'quantity' => 3,
        ]);
        $cartId = $addResponse->json('id');

        $sessionResponse = $this->postJson($this->tenantUrl('/api/v1/checkout/session'), ['cart_id' => $cartId]);
        $sessionId = $sessionResponse->json('id');

        $response = $this->postJson($this->tenantUrl("/api/v1/checkout/session/{$sessionId}/complete"));

        $response->assertCreated();
        $this->assertSame('paid', $response->json('status'));
        $this->assertSame(7500, $response->json('total_minor')); // 3 * 2500
        $this->assertCount(1, $response->json('items'));

        $this->inTenant(function () use ($cartId) {
            $this->assertSame('converted', Cart::find($cartId)->status);
        });
    }
}
