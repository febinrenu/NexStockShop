<?php

declare(strict_types=1);

namespace Tests\Feature\Central;

use App\Models\Central\PlatformAdmin;
use App\Models\Central\PlatformSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_requires_platform_auth(): void
    {
        $this->getJson('/api/v1/central/platform/settings')->assertUnauthorized();
    }

    public function test_index_returns_stored_settings(): void
    {
        PlatformSetting::set('supported_currencies', ['USD', 'CFA', 'SAR']);
        $token = $this->platformToken();

        $response = $this->withToken($token)->getJson('/api/v1/central/platform/settings');

        $response->assertOk();
        $this->assertSame(['USD', 'CFA', 'SAR'], $response->json('supported_currencies'));
    }

    public function test_update_requires_platform_auth(): void
    {
        $this->patchJson('/api/v1/central/platform/settings', ['settings' => ['maintenance_mode' => true]])
            ->assertUnauthorized();
    }

    public function test_update_persists_new_settings(): void
    {
        $token = $this->platformToken();

        $response = $this->withToken($token)->patchJson('/api/v1/central/platform/settings', [
            'settings' => ['maintenance_mode' => true, 'default_plan' => 'starter'],
        ]);

        $response->assertOk();
        $this->assertTrue($response->json('maintenance_mode'));
        $this->assertSame('starter', $response->json('default_plan'));

        $this->assertSame('starter', PlatformSetting::get('default_plan'));
    }

    private function platformToken(): string
    {
        $admin = PlatformAdmin::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password123']);

        return $admin->createToken('t')->plainTextToken;
    }
}
