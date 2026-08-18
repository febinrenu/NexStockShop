<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Central\Plan;
use App\Models\Central\PlatformAdmin;
use Illuminate\Database\Seeder;

/**
 * Seeds the central database only. Tenant databases are seeded
 * per-tenant, on demand, inside Tenant::run() (see SignupController and
 * TenantIsolationTest for examples) — there is no "seed every tenant"
 * step here because tenants don't exist until someone signs up.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        PlatformAdmin::factory()->create([
            'name' => 'Platform Super Admin',
            'email' => 'admin@trippleshop.test',
        ]);

        foreach ($this->plans() as $plan) {
            Plan::firstOrCreate(['slug' => $plan['slug']], $plan);
        }
    }

    private function plans(): array
    {
        return [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'price_cents' => 0,
                'currency' => 'USD',
                'billing_interval' => 'month',
                'product_limit' => 25,
                'staff_limit' => 1,
                'feature_flags' => ['ai_onboarding' => false, 'custom_domain' => false],
                'is_active' => true,
            ],
            [
                'name' => 'Growth',
                'slug' => 'growth',
                'price_cents' => 2900,
                'currency' => 'USD',
                'billing_interval' => 'month',
                'product_limit' => 500,
                'staff_limit' => 5,
                'feature_flags' => ['ai_onboarding' => true, 'custom_domain' => true],
                'is_active' => true,
            ],
            [
                'name' => 'Scale',
                'slug' => 'scale',
                'price_cents' => 9900,
                'currency' => 'USD',
                'billing_interval' => 'month',
                'product_limit' => null,
                'staff_limit' => null,
                'feature_flags' => ['ai_onboarding' => true, 'custom_domain' => true, 'priority_support' => true],
                'is_active' => true,
            ],
        ];
    }
}
