<?php

declare(strict_types=1);

namespace Tests\Feature\Central;

use App\Models\Central\PlatformAdmin;
use App\Models\Central\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class TenantManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_requires_platform_auth(): void
    {
        $this->getJson('/api/v1/central/tenants')->assertUnauthorized();
    }

    public function test_index_lists_tenants_filtered_by_status(): void
    {
        $this->makeTenant(['status' => 'active']);
        $this->makeTenant(['status' => 'suspended']);
        $token = $this->platformToken();

        $response = $this->withToken($token)->getJson('/api/v1/central/tenants?status=suspended');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_update_rejects_an_invalid_status(): void
    {
        $tenant = $this->makeTenant();
        $token = $this->platformToken();

        $response = $this->withToken($token)->patchJson("/api/v1/central/tenants/{$tenant->id}", ['status' => 'pending']);

        $response->assertStatus(422);
    }

    public function test_platform_admin_can_suspend_a_tenant(): void
    {
        $tenant = $this->makeTenant(['status' => 'active']);
        $token = $this->platformToken();

        $response = $this->withToken($token)->patchJson("/api/v1/central/tenants/{$tenant->id}", ['status' => 'suspended']);

        $response->assertOk();
        $this->assertSame('suspended', $tenant->fresh()->status);
    }

    private function makeTenant(array $overrides = []): Tenant
    {
        return Tenant::create(array_merge([
            'id' => (string) Str::uuid(),
            'name' => 'Acme',
            'status' => 'active',
        ], $overrides));
    }

    private function platformToken(): string
    {
        $admin = PlatformAdmin::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password123']);

        return $admin->createToken('t')->plainTextToken;
    }
}
