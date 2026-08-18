<?php

declare(strict_types=1);

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

/**
 * Central moderation queue. flaggable_type/flaggable_id reference an entity
 * that may live in a tenant database (a product, a review) — so this is a
 * loose polymorphic reference (string columns, no Eloquent morph relation
 * across databases), not a same-database morphTo.
 */
class ModerationFlag extends Model
{
    use CentralConnection;

    protected $fillable = [
        'flaggable_type',
        'flaggable_id',
        'tenant_id',
        'reason',
        'status',
        'source',
        'actioned_by',
        'actioned_at',
    ];

    protected function casts(): array
    {
        return ['actioned_at' => 'datetime'];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}
