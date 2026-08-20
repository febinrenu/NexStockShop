<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\Product;
use Tests\TenantTestCase;

class SellerProductTest extends TenantTestCase
{
    public function test_store_requires_tenant_auth(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/products'), $this->productPayload());

        $response->assertUnauthorized();
    }

    public function test_store_validates_required_fields(): void
    {
        $owner = $this->makeTenantUser('owner');

        $response = $this->withToken($owner['token'])->postJson($this->tenantUrl('/api/v1/products'), []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['sku', 'slug', 'translations', 'variants']);
    }

    public function test_owner_can_create_a_product_with_variant_price_and_inventory(): void
    {
        $owner = $this->makeTenantUser('owner');

        $response = $this->withToken($owner['token'])->postJson($this->tenantUrl('/api/v1/products'), $this->productPayload());

        $response->assertCreated();
        $this->assertSame('New Product', $response->json('name'));
        $this->assertSame(1999, $response->json('price.amount_minor'));
        $this->assertSame('https://example.com/photo.jpg', $response->json('image_url'));

        $this->inTenant(function () {
            $this->assertSame(1, Product::count());
        });
    }

    public function test_staff_can_also_create_a_product(): void
    {
        $staff = $this->makeTenantUser('staff');

        $response = $this->withToken($staff['token'])->postJson($this->tenantUrl('/api/v1/products'), $this->productPayload());

        $response->assertCreated();
    }

    public function test_owner_can_update_a_product(): void
    {
        $owner = $this->makeTenantUser('owner');
        $seed = $this->seedProduct();

        $response = $this->withToken($owner['token'])->putJson($this->tenantUrl("/api/v1/products/{$seed['product']->id}"), [
            'status' => 'archived',
            'translations' => [['locale' => 'en', 'name' => 'Renamed Product']],
        ]);

        $response->assertOk();
        $this->assertSame('Renamed Product', $response->json('name'));

        $this->inTenant(function () use ($seed) {
            $this->assertSame('archived', $seed['product']->fresh()->status);
        });
    }

    public function test_owner_can_delete_a_product(): void
    {
        $owner = $this->makeTenantUser('owner');
        $seed = $this->seedProduct();

        $response = $this->withToken($owner['token'])->deleteJson($this->tenantUrl("/api/v1/products/{$seed['product']->id}"));

        $response->assertNoContent();

        $this->inTenant(function () {
            $this->assertSame(0, Product::count());
        });
    }

    private function productPayload(): array
    {
        return [
            'sku' => 'SKU-NEW-1',
            'slug' => 'new-product',
            'status' => 'active',
            'translations' => [
                ['locale' => 'en', 'name' => 'New Product', 'description' => 'A brand new product.'],
            ],
            'variants' => [
                [
                    'sku' => 'SKU-NEW-1-V1',
                    'is_default' => true,
                    'image_url' => 'https://example.com/photo.jpg',
                    'prices' => [['currency' => 'USD', 'amount_minor' => 1999]],
                    'inventory' => ['quantity_available' => 5],
                ],
            ],
        ];
    }
}
