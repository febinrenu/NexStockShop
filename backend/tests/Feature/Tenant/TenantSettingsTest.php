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
}
