<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use Tests\TenantTestCase;

class CustomerProfileTest extends TenantTestCase
{
    public function test_show_requires_customer_auth(): void
    {
        $this->getJson($this->tenantUrl('/api/v1/me'))->assertUnauthorized();
    }

    public function test_show_returns_the_authenticated_customer(): void
    {
        $customer = $this->makeCustomer(['name' => 'Jane Shopper']);

        $response = $this->withToken($customer['token'])->getJson($this->tenantUrl('/api/v1/me'));

        $response->assertOk();
        $this->assertSame('Jane Shopper', $response->json('name'));
    }

    public function test_update_validates_preferred_locale(): void
    {
        $customer = $this->makeCustomer();

        $response = $this->withToken($customer['token'])
            ->patchJson($this->tenantUrl('/api/v1/me'), ['preferred_locale' => 'fr']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('preferred_locale');
    }

    public function test_update_changes_the_profile(): void
    {
        $customer = $this->makeCustomer();

        $response = $this->withToken($customer['token'])
            ->patchJson($this->tenantUrl('/api/v1/me'), ['name' => 'Updated Name', 'preferred_locale' => 'ar']);

        $response->assertOk();
        $this->assertSame('Updated Name', $response->json('name'));
        $this->assertSame('ar', $response->json('preferred_locale'));
    }
}
