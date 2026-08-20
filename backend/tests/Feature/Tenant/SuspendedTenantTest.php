<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use Tests\TenantTestCase;

/**
 * Confirms EnsureTenantIsActive actually blocks a suspended store — a
 * platform admin's suspend action (TenantManagementTest, central-side)
 * would otherwise have no real effect on the tenant's own API.
 */
class SuspendedTenantTest extends TenantTestCase
{
    public function test_suspended_tenant_blocks_even_public_routes(): void
    {
        $this->tenant->update(['status' => 'suspended']);

        $response = $this->getJson($this->tenantUrl('/api/v1/settings'));

        $response->assertForbidden();
    }

    public function test_pending_tenant_is_not_blocked(): void
    {
        $this->tenant->update(['status' => 'pending']);

        $response = $this->getJson($this->tenantUrl('/api/v1/settings'));

        $response->assertOk();
    }
}
