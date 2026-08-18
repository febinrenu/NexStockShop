<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Central\PlatformAdmin;
use App\Models\Central\Tenant;
use App\Models\Tenant\Customer;
use App\Models\Tenant\User as TenantUser;
use Database\Seeders\TenantPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Proves the claim made in §3 of the Person A plan: "a leaked shopper
 * token cannot authenticate against tenant-admin or platform endpoints,
 * and vice versa." Backed by Sanctum's per-guard `provider` check
 * (Laravel\Sanctum\Guard::hasValidProvider) — see the comment on the
 * `platform`/`tenant`/`customer` guards in config/auth.php.
 */
class GuardIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private string $domain;

    private string $customerToken;

    private string $tenantAdminToken;

    private string $platformToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->domain = 'guardtest-'.Str::random(6).'.isolationtest';

        $this->tenant = Tenant::create(['id' => (string) Str::uuid(), 'name' => $this->domain, 'status' => 'active']);
        $this->tenant->domains()->create(['domain' => $this->domain]);

        $this->tenant->run(function () {
            (new TenantPermissionsSeeder)->run();

            $customer = Customer::create([
                'name' => 'Shopper',
                'email' => 'shopper@example.com',
                'password' => 'password123',
            ]);
            $this->customerToken = $customer->createToken('t')->plainTextToken;

            $staff = TenantUser::create([
                'name' => 'Seller Staff',
                'email' => 'staff@example.com',
                'role' => 'owner',
                'password' => 'password123',
            ]);
            $staff->assignRole('owner');
            $this->tenantAdminToken = $staff->createToken('t')->plainTextToken;
        });

        $admin = PlatformAdmin::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);
        $this->platformToken = $admin->createToken('t')->plainTextToken;
    }

    protected function tearDown(): void
    {
        tenancy()->end();

        $this->tenant->delete();

        parent::tearDown();
    }

    public function test_customer_token_cannot_access_tenant_admin_endpoint(): void
    {
        $response = $this->withToken($this->customerToken)
            ->postJson("http://{$this->domain}/api/v1/auth/invite", ['name' => 'X', 'email' => 'x@example.com']);

        $response->assertUnauthorized();
    }

    public function test_tenant_admin_token_cannot_access_customer_endpoint(): void
    {
        $response = $this->withToken($this->tenantAdminToken)
            ->getJson("http://{$this->domain}/api/v1/me");

        $response->assertUnauthorized();
    }

    public function test_customer_token_cannot_access_platform_endpoint(): void
    {
        $response = $this->withToken($this->customerToken)
            ->getJson('http://localhost/api/v1/central/auth/me');

        $response->assertUnauthorized();
    }

    public function test_platform_token_cannot_access_tenant_customer_endpoint(): void
    {
        $response = $this->withToken($this->platformToken)
            ->getJson("http://{$this->domain}/api/v1/me");

        $response->assertUnauthorized();
    }

    // Each of these is its own test (rather than three chained calls in
    // one method) because within a single PHPUnit test the app instance —
    // and with it, whichever DB connection InitializeTenancyByDomain last
    // swapped in — is reused across calls, which a real deployment never
    // does (each HTTP request is its own process/lifecycle). Chaining a
    // tenant-domain call before a central-domain call in one test method
    // would leave the central call still pointed at the tenant connection.
    public function test_customer_token_works_against_its_own_guard(): void
    {
        $this->withToken($this->customerToken)
            ->getJson("http://{$this->domain}/api/v1/me")
            ->assertOk();
    }

    public function test_tenant_admin_token_works_against_its_own_guard(): void
    {
        $this->withToken($this->tenantAdminToken)
            ->postJson("http://{$this->domain}/api/v1/auth/invite", ['name' => 'X', 'email' => 'newstaff@example.com'])
            ->assertCreated();
    }

    public function test_platform_token_works_against_its_own_guard(): void
    {
        $this->withToken($this->platformToken)
            ->getJson('http://localhost/api/v1/central/auth/me')
            ->assertOk();
    }
}
