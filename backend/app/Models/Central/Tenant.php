<?php

declare(strict_types=1);

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    protected $fillable = [
        'id',
        'name',
        'status',
        'branding_logo_url',
        'branding_theme',
        'branding_primary_color',
        'default_locale',
        'default_currency',
        'trial_ends_at',
    ];

    /**
     * Real, migrated columns on `tenants` — must be listed here or the
     * base Tenant model's VirtualColumn trait silently packs them into the
     * `data` JSON blob instead of the real columns (it defaults to only
     * treating `id` as a real column). Caught by live-testing the
     * onboarding flow: inserts failed with "Field 'name' doesn't have a
     * default value" because `name`/`status` were ending up in `data`.
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'status',
            'branding_logo_url',
            'branding_theme',
            'branding_primary_color',
            'default_locale',
            'default_currency',
            'trial_ends_at',
        ];
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class, 'tenant_id')->latestOfMany();
    }
}
