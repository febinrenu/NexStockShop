<?php

declare(strict_types=1);

namespace Tests\Feature\Central;

use App\Models\Central\Plan;
use App\Models\Central\PlatformAdmin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PlanTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_requires_platform_auth(): void
    {
        $this->getJson('/api/v1/central/plans')->assertUnauthorized();
    }

    public function test_index_lists_plans(): void
    {
        Plan::create($this->planAttributes());
        $token = $this->platformToken();

        $response = $this->withToken($token)->getJson('/api/v1/central/plans');

        $response->assertOk();
        $this->assertCount(1, $response->json());
    }

    public function test_store_validates_required_fields(): void
    {
        $token = $this->platformToken();

        $response = $this->withToken($token)->postJson('/api/v1/central/plans', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'slug', 'price_cents', 'currency', 'billing_interval']);
    }

    public function test_platform_admin_can_create_a_plan(): void
    {
        $token = $this->platformToken();
        $attributes = $this->planAttributes();

        $response = $this->withToken($token)->postJson('/api/v1/central/plans', $attributes);

        $response->assertCreated();
        $this->assertSame('Growth', $response->json('name'));
        $this->assertDatabaseHas('plans', ['slug' => $attributes['slug']]);
    }

    public function test_platform_admin_can_update_a_plan(): void
    {
        $plan = Plan::create($this->planAttributes());
        $token = $this->platformToken();

        $response = $this->withToken($token)->putJson("/api/v1/central/plans/{$plan->id}", ['price_cents' => 4900]);

        $response->assertOk();
        $this->assertSame(4900, $plan->fresh()->price_cents);
    }

    private function planAttributes(): array
    {
        return [
            'name' => 'Growth',
            'slug' => 'growth-'.Str::random(6),
            'price_cents' => 2900,
            'currency' => 'USD',
            'billing_interval' => 'month',
        ];
    }

    private function platformToken(): string
    {
        $admin = PlatformAdmin::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password123']);

        return $admin->createToken('t')->plainTextToken;
    }
}
