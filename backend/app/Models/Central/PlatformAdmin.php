<?php

declare(strict_types=1);

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

/**
 * Platform super-admin (guard: platform). Lives on the central connection,
 * in the stock `users` table — structurally incapable of resolving against
 * a tenant database.
 */
class PlatformAdmin extends Authenticatable
{
    use CentralConnection, HasApiTokens, HasFactory, HasRoles, Notifiable;

    protected $table = 'users';

    protected string $guard_name = 'platform';

    protected $fillable = [
        'name',
        'email',
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
