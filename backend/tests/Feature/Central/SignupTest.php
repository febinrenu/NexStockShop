<?php

declare(strict_types=1);

namespace Tests\Feature\Central;

use App\Models\Central\Tenant;
use App\Models\Tenant\Product;
use App\Models\Tenant\ProductTranslation;
use App\Models\Tenant\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SignupTest extends TestCase
{
    use RefreshDatabase;

    /** @var list<Tenant> */
    private array $createdTenants = [];

    protected function tearDown(): void
    {
        tenancy()->end();

        foreach ($this->createdTenants as $tenant) {
            $tenant->fresh()?->delete();
        }

        parent::tearDown();
    }

    public function test_signup_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/central/signup', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['business_name', 'subdomain', 'admin_name', 'admin_email', 'admin_password']);
    }

    public function test_signup_rejects_a_taken_subdomain(): void
    {
        $this->signUp('acme');

        $response = $this->postJson('/api/v1/central/signup', $this->signupPayload('acme'));

        $response->assertStatus(422);
    }

    public function test_signup_provisions_a_real_tenant_database(): void
    {
        $response = $this->signUp('acme2');

        $response->assertCreated();
        $this->assertSame('pending', $response->json('status'));

        $tenant = Tenant::find($response->json('tenant_id'));
        $this->assertNotNull($tenant);

        $ownerExists = $tenant->run(fn () => User::where('email', 'jane@acme.test')->exists());
        $this->assertTrue($ownerExists);
    }

    public function test_theme_updates_branding(): void
    {
        $signup = $this->signUp('acme3');
        $tenantId = $signup->json('tenant_id');

        $response = $this->postJson("/api/v1/central/onboarding/{$tenantId}/theme", [
            'template_id' => 'modern-01',
            'primary_color' => '#112233',
        ]);

        $response->assertOk();
        $this->assertSame('modern-01', $response->json('branding_theme'));
    }

    public function test_go_live_rejects_a_tenant_with_no_products(): void
    {
        $signup = $this->signUp('acme4');
        $tenantId = $signup->json('tenant_id');

        $response = $this->postJson("/api/v1/central/onboarding/{$tenantId}/go-live");

        $response->assertStatus(422);
    }

    public function test_go_live_activates_a_tenant_with_a_product(): void
    {
        $signup = $this->signUp('acme5');
        $tenantId = $signup->json('tenant_id');
        $tenant = Tenant::find($tenantId);

        $tenant->run(function () {
            $product = Product::create([
                'sku' => 'SKU-1',
                'slug' => 'first-product',
                'status' => 'active',
            ]);
            ProductTranslation::create([
                'product_id' => $product->id,
                'locale' => 'en',
                'name' => 'First Product',
            ]);
        });

        $response = $this->postJson("/api/v1/central/onboarding/{$tenantId}/go-live");

        $response->assertOk();
        $this->assertSame('active', $response->json('status'));
    }

    private function signUp(string $subdomain)
    {
        $response = $this->postJson('/api/v1/central/signup', $this->signupPayload($subdomain));

        if ($response->status() === 201) {
            $this->createdTenants[] = Tenant::find($response->json('tenant_id'));
        }

        return $response;
    }

    private function signupPayload(string $subdomain): array
    {
        return [
            'business_name' => 'Acme Test',
            'subdomain' => $subdomain,
            'admin_name' => 'Jane',
            'admin_email' => 'jane@acme.test',
            'admin_password' => 'password123',
        ];
    }
}
