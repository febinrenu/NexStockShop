<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\InventoryLevel;
use Tests\TenantTestCase;

class InventoryTest extends TenantTestCase
{
    public function test_update_requires_tenant_auth(): void
    {
        $seed = $this->seedProduct();

        $response = $this->patchJson($this->tenantUrl("/api/v1/inventory/{$seed['variant']->id}"), [
            'quantity_available' => 3,
        ]);

        $response->assertUnauthorized();
    }

    public function test_update_validates_quantity(): void
    {
        $owner = $this->makeTenantUser('owner');
        $seed = $this->seedProduct();

        $response = $this->withToken($owner['token'])
            ->patchJson($this->tenantUrl("/api/v1/inventory/{$seed['variant']->id}"), ['quantity_available' => -1]);

        $response->assertStatus(422);
    }

    public function test_owner_can_update_stock_levels(): void
    {
        $owner = $this->makeTenantUser('owner');
        $seed = $this->seedProduct();

        $response = $this->withToken($owner['token'])->patchJson($this->tenantUrl("/api/v1/inventory/{$seed['variant']->id}"), [
            'quantity_available' => 42,
            'quantity_reserved' => 2,
        ]);

        $response->assertOk();
        $this->assertSame(42, $response->json('quantity_available'));
        $this->assertSame(2, $response->json('quantity_reserved'));

        $this->inTenant(function () use ($seed) {
            $this->assertSame(42, InventoryLevel::where('product_variant_id', $seed['variant']->id)->first()->quantity_available);
        });
    }
}
