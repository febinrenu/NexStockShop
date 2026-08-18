<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\Customer;
use Tests\TenantTestCase;

class CustomerAuthTest extends TenantTestCase
{
    public function test_register_validates_required_fields(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/customer/auth/register'), []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        $this->makeCustomer(['email' => 'dup@example.com']);

        $response = $this->postJson($this->tenantUrl('/api/v1/customer/auth/register'), [
            'name' => 'Someone',
            'email' => 'dup@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_register_creates_a_customer_and_returns_a_token(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/customer/auth/register'), [
            'name' => 'Jane Shopper',
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $response->assertCreated();
        $this->assertNotEmpty($response->json('token'));
        $this->assertSame('en', $response->json('customer.preferred_locale'));
    }

    public function test_login_rejects_wrong_password(): void
    {
        $this->makeCustomer(['email' => 'jane@example.com']);

        $response = $this->postJson($this->tenantUrl('/api/v1/customer/auth/login'), [
            'email' => 'jane@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_login_succeeds_with_correct_credentials(): void
    {
        $this->inTenant(fn () => Customer::create([
            'name' => 'Jane Shopper',
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]));

        $response = $this->postJson($this->tenantUrl('/api/v1/customer/auth/login'), [
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();
        $this->assertNotEmpty($response->json('token'));
    }

    public function test_password_reset_requires_auth(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/customer/auth/password-reset'), ['password' => 'newpassword123']);

        $response->assertUnauthorized();
    }

    public function test_logout_revokes_the_token(): void
    {
        $customer = $this->makeCustomer();

        $this->withToken($customer['token'])->postJson($this->tenantUrl('/api/v1/customer/auth/logout'))->assertOk();

        $this->inTenant(function () use ($customer) {
            $this->assertSame(0, $customer['customer']->tokens()->count());
        });
    }
}
