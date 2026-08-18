<?php

declare(strict_types=1);

namespace Tests;

use App\Models\Central\Tenant;
use App\Models\Tenant\Category;
use App\Models\Tenant\Customer;
use App\Models\Tenant\InventoryLevel;
use App\Models\Tenant\Price;
use App\Models\Tenant\Product;
use App\Models\Tenant\ProductTranslation;
use App\Models\Tenant\ProductVariant;
use App\Models\Tenant\User;
use Database\Seeders\TenantPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

/**
 * Base class for tests that hit tenant-scoped routes. Provisions one real
 * throwaway tenant (its own real MySQL database, migrated via the same
 * CreateDatabase + MigrateDatabase job pipeline used in production) and
 * exposes helpers for making requests against it and seeding data inside
 * its own connection.
 */
abstract class TenantTestCase extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected string $domain;

    protected function setUp(): void
    {
        parent::setUp();

        $this->domain = 'test-'.Str::random(8).'.endpointtest';

        $this->tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => $this->domain,
            'status' => 'active',
        ]);
        $this->tenant->domains()->create(['domain' => $this->domain]);
    }

    protected function tearDown(): void
    {
        // A test that never calls inTenant()/seedProduct() but does hit a
        // tenant-domain route (e.g. one that only exercises a validation
        // failure) can leave the default DB connection pointed at 'tenant'
        // afterward — Laravel's test HTTP client doesn't invoke terminating
        // middleware, so stancl/tenancy never gets a chance to revert it.
        // Ending tenancy explicitly here guarantees delete() always runs
        // against the central connection, regardless of what the test body did.
        tenancy()->end();

        $this->tenant->delete();

        parent::tearDown();
    }

    protected function tenantUrl(string $path): string
    {
        return 'http://'.$this->domain.$path;
    }

    /** Run a closure inside this test's tenant database connection. */
    protected function inTenant(\Closure $callback): mixed
    {
        return $this->tenant->run($callback);
    }

    /**
     * Creates a category > product > variant > price chain and returns the
     * created models keyed by type, plus a $productId/$variantId shortcut.
     */
    protected function seedProduct(array $overrides = []): array
    {
        return $this->inTenant(function () use ($overrides) {
            $category = Category::create(['slug' => 'cat-'.Str::random(6)]);

            $product = Product::create(array_merge([
                'category_id' => $category->id,
                'sku' => 'SKU-'.Str::random(10),
                'slug' => 'prod-'.Str::random(6),
                'status' => 'active',
            ], $overrides));

            ProductTranslation::create([
                'product_id' => $product->id,
                'locale' => 'en',
                'name' => 'Test Product',
                'description' => 'A product used in tests.',
            ]);

            $variant = ProductVariant::create([
                'product_id' => $product->id,
                'sku' => $product->sku.'-V1',
                'is_default' => true,
            ]);

            InventoryLevel::create([
                'product_variant_id' => $variant->id,
                'quantity_available' => 10,
            ]);

            Price::create([
                'product_variant_id' => $variant->id,
                'currency' => 'USD',
                'amount_minor' => 2500,
            ]);

            return ['category' => $category, 'product' => $product, 'variant' => $variant];
        });
    }

    protected function makeCustomer(array $overrides = []): array
    {
        return $this->inTenant(function () use ($overrides) {
            $customer = Customer::create(array_merge([
                'name' => 'Test Shopper',
                'email' => 'shopper-'.Str::random(8).'@example.com',
                'password' => 'password123',
            ], $overrides));

            return ['customer' => $customer, 'token' => $customer->createToken('t')->plainTextToken];
        });
    }

    protected function makeTenantUser(string $role = 'owner', array $overrides = []): array
    {
        return $this->inTenant(function () use ($role, $overrides) {
            (new TenantPermissionsSeeder)->run();

            $user = User::create(array_merge([
                'name' => 'Test Staff',
                'email' => 'staff-'.Str::random(8).'@example.com',
                'role' => $role,
                'password' => 'password123',
            ], $overrides));
            $user->assignRole($role);

            return ['user' => $user, 'token' => $user->createToken('t')->plainTextToken];
        });
    }
}
