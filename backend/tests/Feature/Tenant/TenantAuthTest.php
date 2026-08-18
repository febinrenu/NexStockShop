<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\User;
use Tests\TenantTestCase;

class TenantAuthTest extends TenantTestCase
{
    public function test_login_validates_required_fields(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/auth/login'), []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_rejects_wrong_password(): void
    {
        $this->makeTenantUser('owner', ['email' => 'owner@example.com']);

        $response = $this->postJson($this->tenantUrl('/api/v1/auth/login'), [
            'email' => 'owner@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_login_succeeds_with_correct_credentials(): void
    {
        $this->inTenant(fn () => User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'role' => 'owner',
            'password' => 'password123',
        ]));

        $response = $this->postJson($this->tenantUrl('/api/v1/auth/login'), [
            'email' => 'owner@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();
        $this->assertNotEmpty($response->json('token'));
        $this->assertSame('owner', $response->json('user.role'));
    }

    public function test_invite_requires_tenant_auth(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/auth/invite'), [
            'name' => 'New Staff',
            'email' => 'staff@example.com',
        ]);

        $response->assertUnauthorized();
    }

    public function test_invite_validates_unique_email(): void
    {
        $owner = $this->makeTenantUser('owner', ['email' => 'existing@example.com']);

        $response = $this->withToken($owner['token'])->postJson($this->tenantUrl('/api/v1/auth/invite'), [
            'name' => 'Duplicate',
            'email' => 'existing@example.com',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_invite_creates_a_staff_account(): void
    {
        $owner = $this->makeTenantUser('owner');

        $response = $this->withToken($owner['token'])->postJson($this->tenantUrl('/api/v1/auth/invite'), [
            'name' => 'New Staff',
            'email' => 'newstaff@example.com',
        ]);

        $response->assertCreated();
        $this->assertSame('staff', $response->json('user.role'));
        $this->assertNotEmpty($response->json('setup_token'));
    }

    public function test_invite_is_rejected_for_a_staff_account(): void
    {
        $staff = $this->makeTenantUser('staff');

        $response = $this->withToken($staff['token'])->postJson($this->tenantUrl('/api/v1/auth/invite'), [
            'name' => 'Another Staff',
            'email' => 'another@example.com',
        ]);

        $response->assertForbidden();
    }

    public function test_password_reset_requires_auth(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/auth/password-reset'), ['password' => 'newpassword123']);

        $response->assertUnauthorized();
    }

    public function test_password_reset_validates_minimum_length(): void
    {
        $owner = $this->makeTenantUser('owner');

        $response = $this->withToken($owner['token'])
            ->postJson($this->tenantUrl('/api/v1/auth/password-reset'), ['password' => 'short']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
    }

    public function test_logout_revokes_the_token(): void
    {
        $owner = $this->makeTenantUser('owner');

        $this->withToken($owner['token'])->postJson($this->tenantUrl('/api/v1/auth/logout'))->assertOk();

        $this->inTenant(function () use ($owner) {
            $this->assertSame(0, $owner['user']->tokens()->count());
        });
    }
}
