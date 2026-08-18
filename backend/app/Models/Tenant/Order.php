<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'customer_id', 'checkout_session_id', 'status', 'currency',
        'subtotal_minor', 'discount_minor', 'shipping_minor', 'total_minor',
        'shipping_address_id', 'placed_at',
    ];

    protected function casts(): array
    {
        return ['placed_at' => 'datetime'];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at');
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    public function recordStatus(string $status, ?string $note = null): void
    {
        $this->update(['status' => $status]);
        $this->statusHistory()->create(['status' => $status, 'note' => $note]);
    }
}
