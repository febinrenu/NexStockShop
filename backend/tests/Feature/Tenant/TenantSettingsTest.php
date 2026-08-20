<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use Tests\TenantTestCase;

class TenantSettingsTest extends TenantTestCase
{
    public function test_settings_returns_branding_info(): void
    {
        $this->tenant->update([
            'branding_theme' => 'modern-01',
            'branding_primary_color' => '#112233',
            'default_currency' => 'SAR',
        ]);

        $response = $this->getJson($this->tenantUrl('/api/v1/settings'));

        $response->assertOk();
        $this->assertSame('modern-01', $response->json('branding.theme'));
        $this->assertSame('#112233', $response->json('branding.primary_color'));
        $this->assertSame('SAR', $response->json('default_currency'));
    }

    public function test_update_requires_tenant_auth(): void
    {
        $response = $this->patchJson($this->tenantUrl('/api/v1/settings'), ['default_currency' => 'USD']);

        $response->assertUnauthorized();
    }

    public function test_update_is_rejected_for_a_staff_account(): void
    {
        $staff = $this->makeTenantUser('staff');

        $response = $this->withToken($staff['token'])
            ->patchJson($this->tenantUrl('/api/v1/settings'), ['default_currency' => 'USD']);

        $response->assertForbidden();
    }

    public function test_owner_can_update_branding_and_locale(): void
    {
        $owner = $this->makeTenantUser('owner');

        $response = $this->withToken($owner['token'])->patchJson($this->tenantUrl('/api/v1/settings'), [
            'branding' => ['theme' => 'dark-01', 'primary_color' => '#000000'],
            'default_locale' => 'ar',
            'default_currency' => 'SAR',
        ]);

        $response->assertOk();
        $this->assertSame('dark-01', $response->json('branding.theme'));
        $this->assertSame('#000000', $response->json('branding.primary_color'));
        $this->assertSame('ar', $response->json('default_locale'));
        $this->assertSame('SAR', $response->json('default_currency'));
    }
}
