<?php

declare(strict_types=1);

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class Invoice extends Model
{
    use CentralConnection;

    protected $fillable = [
        'subscription_id',
        'tenant_id',
        'amount_minor',
        'currency',
        'status',
        'provider_invoice_id',
        'issued_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}
