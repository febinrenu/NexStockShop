<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\Brand;
use App\Models\Tenant\Category;
use App\Models\Tenant\CategoryTranslation;
use App\Models\Tenant\Discount;
use App\Models\Tenant\ProductTranslation;
use Tests\TenantTestCase;

class CatalogTest extends TenantTestCase
{
    public function test_products_index_returns_active_products(): void
    {
        $this->seedProduct();

        $response = $this->getJson($this->tenantUrl('/api/v1/products'));

        $response->assertOk();
        $this->assertNotEmpty($response->json('data'));
        $this->assertSame('Test Product', $response->json('data.0.name'));
        $this->assertSame('25.00 USD', $response->json('data.0.price.formatted'));
    }

    public function test_products_index_respects_locale_query_param(): void
    {
        $seeded = $this->seedProduct();
        $this->inTenant(function () use ($seeded) {
            ProductTranslation::create([
                'product_id' => $seeded['product']->id,
                'locale' => 'ar',
                'name' => 'منتج تجريبي',
            ]);
        });

        $response = $this->getJson($this->tenantUrl('/api/v1/products?lang=ar'));

        $response->assertOk();
        $this->assertSame('منتج تجريبي', $response->json('data.0.name'));
        $this->assertSame('ar', $response->json('locale'));
    }

    public function test_product_show_returns_404_for_missing_product(): void
    {
        $response = $this->getJson($this->tenantUrl('/api/v1/products/999999'));

        $response->assertNotFound();
    }

    public function test_product_show_computes_discount_badge(): void
    {
        $seeded = $this->seedProduct();
        $this->inTenant(function () use ($seeded) {
            Discount::create([
                'product_id' => $seeded['product']->id,
                'type' => 'percentage',
                'value' => 20,
                'is_active' => true,
            ]);
        });

        $response = $this->getJson($this->tenantUrl('/api/v1/products/'.$seeded['product']->id));

        $response->assertOk();
        $this->assertSame('-20%', $response->json('discount_badge'));
    }

    public function test_categories_index_returns_only_active_categories(): void
    {
        $this->inTenant(function () {
            $active = Category::create(['slug' => 'active-cat', 'is_active' => true]);
            CategoryTranslation::create(['category_id' => $active->id, 'locale' => 'en', 'name' => 'Active']);

            $inactive = Category::create(['slug' => 'inactive-cat', 'is_active' => false]);
            CategoryTranslation::create(['category_id' => $inactive->id, 'locale' => 'en', 'name' => 'Inactive']);
        });

        $response = $this->getJson($this->tenantUrl('/api/v1/categories'));

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Active'));
        $this->assertFalse($names->contains('Inactive'));
    }

    public function test_brands_index_returns_only_active_brands(): void
    {
        $this->inTenant(function () {
            Brand::create(['name' => 'Active Brand', 'slug' => 'active-brand', 'is_active' => true]);
            Brand::create(['name' => 'Inactive Brand', 'slug' => 'inactive-brand', 'is_active' => false]);
        });

        $response = $this->getJson($this->tenantUrl('/api/v1/brands'));

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Active Brand'));
        $this->assertFalse($names->contains('Inactive Brand'));
    }

    public function test_search_requires_a_query_string(): void
    {
        $response = $this->getJson($this->tenantUrl('/api/v1/search'));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('q');
    }

    public function test_search_finds_products_by_translated_name(): void
    {
        $this->seedProduct();

        $response = $this->getJson($this->tenantUrl('/api/v1/search?q=Test+Product'));

        $response->assertOk();
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_search_returns_empty_for_no_match(): void
    {
        $this->seedProduct();

        $response = $this->getJson($this->tenantUrl('/api/v1/search?q=NoSuchThingExists'));

        $response->assertOk();
        $this->assertEmpty($response->json('data'));
    }
}
