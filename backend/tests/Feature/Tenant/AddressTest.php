<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\Address;
use Tests\TenantTestCase;

class AddressTest extends TenantTestCase
{
    public function test_index_requires_customer_auth(): void
    {
        $this->getJson($this->tenantUrl('/api/v1/me/addresses'))->assertUnauthorized();
    }

    public function test_store_validates_required_fields(): void
    {
        $customer = $this->makeCustomer();

        $response = $this->withToken($customer['token'])->postJson($this->tenantUrl('/api/v1/me/addresses'), []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['recipient_name', 'line1', 'city', 'country']);
    }

    public function test_customer_can_create_an_address(): void
    {
        $customer = $this->makeCustomer();

        $response = $this->withToken($customer['token'])->postJson($this->tenantUrl('/api/v1/me/addresses'), [
            'recipient_name' => 'Jane Doe',
            'line1' => '123 Main St',
            'city' => 'Accra',
            'country' => 'GH',
            'is_default' => true,
        ]);

        $response->assertCreated();
        $this->assertSame('Jane Doe', $response->json('recipient_name'));
        $this->assertTrue($response->json('is_default'));
    }

    public function test_setting_a_new_default_unsets_the_previous_one(): void
    {
        $customer = $this->makeCustomer();
        $token = $customer['token'];

        $first = $this->withToken($token)->postJson($this->tenantUrl('/api/v1/me/addresses'), [
            'recipient_name' => 'Jane Doe', 'line1' => '123 Main St', 'city' => 'Accra', 'country' => 'GH', 'is_default' => true,
        ])->json('id');

        $this->withToken($token)->postJson($this->tenantUrl('/api/v1/me/addresses'), [
            'recipient_name' => 'Jane Doe', 'line1' => '456 Second St', 'city' => 'Accra', 'country' => 'GH', 'is_default' => true,
        ]);

        $this->inTenant(function () use ($first) {
            $this->assertFalse(Address::find($first)->is_default);
        });
    }

    public function test_a_customer_cannot_update_another_customers_address(): void
    {
        $owner = $this->makeCustomer();
        $intruder = $this->makeCustomer();

        // Created directly (not via an authenticated HTTP call) so this
        // test only ever makes one authenticated request with one token —
        // Sanctum's RequestGuard::user() caches the resolved user for the
        // container's lifetime, so chaining two different tokens' calls
        // in one test method would leak the first customer into the
        // second call and mask this exact bug (see TenantTestCase).
        $addressId = $this->inTenant(fn () => $owner['customer']->addresses()->create([
            'recipient_name' => 'Jane Doe', 'line1' => '123 Main St', 'city' => 'Accra', 'country' => 'GH',
        ])->id);

        $response = $this->withToken($intruder['token'])
            ->patchJson($this->tenantUrl("/api/v1/me/addresses/{$addressId}"), ['city' => 'Kumasi']);

        $response->assertForbidden();
    }

    public function test_customer_can_delete_their_own_address(): void
    {
        $customer = $this->makeCustomer();

        $addressId = $this->withToken($customer['token'])->postJson($this->tenantUrl('/api/v1/me/addresses'), [
            'recipient_name' => 'Jane Doe', 'line1' => '123 Main St', 'city' => 'Accra', 'country' => 'GH',
        ])->json('id');

        $response = $this->withToken($customer['token'])->deleteJson($this->tenantUrl("/api/v1/me/addresses/{$addressId}"));

        $response->assertNoContent();

        $this->inTenant(function () use ($addressId) {
            $this->assertNull(Address::find($addressId));
        });
    }
}
