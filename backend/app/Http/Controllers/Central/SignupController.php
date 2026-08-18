<?php

declare(strict_types=1);

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\Domain;
use App\Models\Central\Tenant;
use App\Models\Tenant\Product;
use App\Models\Tenant\User as TenantUser;
use Database\Seeders\TenantPermissionsSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

/**
 * Backend pieces of tenant onboarding (§2.4 of the Person A plan).
 * Theme selection can come from a fixed template library OR an
 * AI-generated result — this controller defines the endpoint contract
 * either way; which generation path is actually wired up is a Person C
 * coordination point, not a blocker for this contract.
 */
class SignupController extends Controller
{
    public function signup(Request $request)
    {
        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'subdomain' => ['required', 'string', 'max:63', 'regex:/^[a-z0-9-]+$/'],
            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email'],
            'admin_password' => ['required', 'string', 'min:8'],
        ]);

        $centralDomains = Config::get('tenancy.central_domains', []);
        $appDomain = preg_replace('/^https?:\/\//', '', config('app.url'));
        $baseDomain = collect($centralDomains)->first(fn ($d) => str_contains($d, '.')) ?? $appDomain;
        $fullDomain = $data['subdomain'].'.'.$baseDomain;

        if (Domain::where('domain', $fullDomain)->exists()) {
            return response()->json(['message' => 'That subdomain is already taken.'], 422);
        }

        $tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => $data['business_name'],
            'status' => 'pending',
        ]);

        $tenant->domains()->create(['domain' => $fullDomain]);

        // Runs the tenant's own migrations inside its own database (see
        // TenancyServiceProvider::events()) and then creates the default
        // owner account inside that same database — never the central one.
        $tenant->run(function () use ($data) {
            (new TenantPermissionsSeeder)->run();

            $owner = TenantUser::create([
                'name' => $data['admin_name'],
                'email' => $data['admin_email'],
                'role' => 'owner',
                'password' => $data['admin_password'],
            ]);
            $owner->assignRole('owner');
        });

        return response()->json([
            'tenant_id' => $tenant->id,
            'domain' => $fullDomain,
            'status' => $tenant->status,
        ], 201);
    }

    public function theme(Request $request, string $tenant)
    {
        $data = $request->validate([
            'template_id' => ['nullable', 'string'],
            'business_description' => ['nullable', 'string'],
            'primary_color' => ['nullable', 'string', 'max:9'],
        ]);

        $t = Tenant::findOrFail($tenant);
        $t->update([
            'branding_theme' => $data['template_id'] ?? 'default',
            'branding_primary_color' => $data['primary_color'] ?? $t->branding_primary_color,
        ]);

        return response()->json(['tenant_id' => $t->id, 'branding_theme' => $t->branding_theme]);
    }

    public function goLive(Request $request, string $tenant)
    {
        $t = Tenant::findOrFail($tenant);

        $hasProduct = $t->run(fn () => Product::query()->exists());

        if (! $hasProduct) {
            return response()->json(['message' => 'Add at least one product before going live.'], 422);
        }

        $t->update(['status' => 'active']);

        return response()->json(['tenant_id' => $t->id, 'status' => $t->status]);
    }
}
