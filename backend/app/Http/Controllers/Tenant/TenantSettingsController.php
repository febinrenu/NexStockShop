<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;

/**
 * Exposes the current tenant's branding settings (§2.1 of the Person A
 * plan: "exposed via a settings endpoint the storefront and admin
 * dashboard both read from"). Public — the storefront needs this before a
 * shopper has ever authenticated.
 */
class TenantSettingsController extends Controller
{
    public function show()
    {
        return response()->json([
            'name' => tenant('name'),
            'branding' => [
                'logo_url' => tenant('branding_logo_url'),
                'theme' => tenant('branding_theme'),
                'primary_color' => tenant('branding_primary_color'),
            ],
            'default_locale' => tenant('default_locale'),
            'default_currency' => tenant('default_currency'),
        ]);
    }
}
