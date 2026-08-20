<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Exposes and updates the current tenant's branding settings (§2.1 of the
 * Person A plan: "exposed via a settings endpoint the storefront and
 * admin dashboard both read from"). show() is public — the storefront
 * needs this before a shopper has ever authenticated. update() requires
 * the `settings.manage` permission (owner-only by default), the same
 * owner/staff distinction §3 already draws for staff.invite.
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

    public function update(Request $request)
    {
        abort_unless($request->user('tenant')->can('settings.manage'), 403, 'Only the store owner can update settings.');

        $data = $request->validate([
            'branding' => ['sometimes', 'array'],
            'branding.logo_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'branding.theme' => ['sometimes', 'nullable', 'string', 'max:255'],
            'branding.primary_color' => ['sometimes', 'nullable', 'string', 'max:9'],
            'default_locale' => ['sometimes', 'string', 'max:8'],
            'default_currency' => ['sometimes', 'string', 'size:3'],
        ]);

        $branding = $data['branding'] ?? [];
        $updates = array_filter([
            'branding_logo_url' => array_key_exists('logo_url', $branding) ? $branding['logo_url'] : null,
            'branding_theme' => array_key_exists('theme', $branding) ? $branding['theme'] : null,
            'branding_primary_color' => array_key_exists('primary_color', $branding) ? $branding['primary_color'] : null,
            'default_locale' => $data['default_locale'] ?? null,
            'default_currency' => $data['default_currency'] ?? null,
        ], fn ($value) => $value !== null);

        tenant()->update($updates);

        return $this->show();
    }
}
