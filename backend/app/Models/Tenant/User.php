<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * Tenant admin / seller-staff user (guard: tenant). Resolves against
 * whichever database is currently active — never explicitly connected, so
 * it is automatically scoped to the tenant that's bootstrapped for the
 * current request (see TenancyServiceProvider / DatabaseTenancyBootstrapper).
 */
class User extends Authenticatable
{
    use HasApiTokens, HasRoles, Notifiable;

    protected string $guard_name = 'tenant';

    protected $fillable = [
        'name',
        'email',
        'role',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
