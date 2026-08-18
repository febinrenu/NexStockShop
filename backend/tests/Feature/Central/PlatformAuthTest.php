<?php

declare(strict_types=1);

namespace Tests\Feature\Central;

use App\Models\Central\PlatformAdmin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/central/auth/login', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_rejects_wrong_password(): void
    {
        PlatformAdmin::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password123']);

        $response = $this->postJson('/api/v1/central/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_login_succeeds_with_correct_credentials(): void
    {
        PlatformAdmin::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password123']);

        $response = $this->postJson('/api/v1/central/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();
        $this->assertNotEmpty($response->json('token'));
    }

    public function test_me_requires_platform_auth(): void
    {
        $this->getJson('/api/v1/central/auth/me')->assertUnauthorized();
    }

    public function test_me_returns_the_authenticated_admin(): void
    {
        $admin = PlatformAdmin::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password123']);
        $token = $admin->createToken('t')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/central/auth/me');

        $response->assertOk();
        $this->assertSame('admin@example.com', $response->json('email'));
    }

    public function test_logout_revokes_the_token(): void
    {
        $admin = PlatformAdmin::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password123']);
        $token = $admin->createToken('t')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/central/auth/logout')->assertOk();

        $this->assertSame(0, $admin->tokens()->count());
    }
}
