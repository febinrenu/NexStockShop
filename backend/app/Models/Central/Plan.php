<?php

declare(strict_types=1);

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class Plan extends Model
{
    use CentralConnection;

    protected $fillable = [
        'name',
        'slug',
        'price_cents',
        'currency',
        'billing_interval',
        'product_limit',
        'staff_limit',
        'feature_flags',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'feature_flags' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
