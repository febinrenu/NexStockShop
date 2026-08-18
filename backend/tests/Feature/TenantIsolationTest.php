<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Central\Tenant;
use App\Models\Tenant\Category;
use App\Models\Tenant\Product;
use App\Models\Tenant\ProductTranslation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Proves the claim made in §2.3 of the Person A plan: a request against
 * tenant A's domain never returns tenant B's rows. Two throwaway tenants
 * are provisioned with their own real databases (via the same
 * CreateDatabase + MigrateDatabase job pipeline used in production), each
 * seeded with a distinctly-named product, then queried through the public
 * catalog API by domain.
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenantA;

    private Tenant $tenantB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenantA = $this->makeTenant('tenant-a-'.Str::random(6).'.isolationtest');
        $this->tenantB = $this->makeTenant('tenant-b-'.Str::random(6).'.isolationtest');

        $this->tenantA->run(fn () => $this->seedOneProduct('Only In Tenant A'));
        $this->tenantB->run(fn () => $this->seedOneProduct('Only In Tenant B'));
    }

    protected function tearDown(): void
    {
        tenancy()->end();

        $this->tenantA->delete();
        $this->tenantB->delete();

        parent::tearDown();
    }

    public function test_tenant_a_catalog_never_returns_tenant_bs_products(): void
    {
        $domain = $this->tenantA->domains()->first()->domain;

        $response = $this->getJson("http://{$domain}/api/v1/products");

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');

        $this->assertTrue($names->contains('Only In Tenant A'));
        $this->assertFalse($names->contains('Only In Tenant B'));
    }

    public function test_tenant_b_catalog_never_returns_tenant_as_products(): void
    {
        $domain = $this->tenantB->domains()->first()->domain;

        $response = $this->getJson("http://{$domain}/api/v1/products");

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');

        $this->assertTrue($names->contains('Only In Tenant B'));
        $this->assertFalse($names->contains('Only In Tenant A'));
    }

    private function makeTenant(string $domain): Tenant
    {
        $tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => $domain,
            'status' => 'active',
        ]);

        $tenant->domains()->create(['domain' => $domain]);

        return $tenant;
    }

    private function seedOneProduct(string $name): void
    {
        $category = Category::create(['slug' => Str::slug($name)]);

        $product = Product::create([
            'category_id' => $category->id,
            'sku' => 'SKU-'.Str::random(10),
            'slug' => Str::slug($name).'-'.Str::random(4),
            'status' => 'active',
        ]);

        ProductTranslation::create([
            'product_id' => $product->id,
            'locale' => 'en',
            'name' => $name,
        ]);
    }
}
