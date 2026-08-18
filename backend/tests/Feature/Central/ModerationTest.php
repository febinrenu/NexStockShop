<?php

declare(strict_types=1);

namespace Tests\Feature\Central;

use App\Models\Central\ModerationFlag;
use App\Models\Central\PlatformAdmin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_requires_platform_auth(): void
    {
        $this->getJson('/api/v1/central/platform/moderation-queue')->assertUnauthorized();
    }

    public function test_index_lists_flags_filtered_by_status(): void
    {
        ModerationFlag::create(['flaggable_type' => 'App\Models\Tenant\Review', 'flaggable_id' => '1', 'reason' => 'x', 'status' => 'pending']);
        ModerationFlag::create(['flaggable_type' => 'App\Models\Tenant\Review', 'flaggable_id' => '2', 'reason' => 'y', 'status' => 'dismissed']);
        $token = $this->platformToken();

        $response = $this->withToken($token)->getJson('/api/v1/central/platform/moderation-queue?status=pending');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_action_requires_a_valid_status(): void
    {
        $flag = ModerationFlag::create(['flaggable_type' => 'App\Models\Tenant\Review', 'flaggable_id' => '1', 'reason' => 'x', 'status' => 'pending']);
        $token = $this->platformToken();

        $response = $this->withToken($token)->postJson("/api/v1/central/platform/moderation-queue/{$flag->id}/action", [
            'status' => 'not-a-real-status',
        ]);

        $response->assertStatus(422);
    }

    public function test_action_marks_the_flag_actioned(): void
    {
        $flag = ModerationFlag::create(['flaggable_type' => 'App\Models\Tenant\Review', 'flaggable_id' => '1', 'reason' => 'x', 'status' => 'pending']);
        $admin = PlatformAdmin::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password123']);
        $token = $admin->createToken('t')->plainTextToken;

        $response = $this->withToken($token)->postJson("/api/v1/central/platform/moderation-queue/{$flag->id}/action", [
            'status' => 'actioned',
        ]);

        $response->assertOk();
        $this->assertSame('actioned', $response->json('status'));
        $this->assertSame($admin->id, $response->json('actioned_by'));
    }

    private function platformToken(): string
    {
        $admin = PlatformAdmin::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password123']);

        return $admin->createToken('t')->plainTextToken;
    }
}
