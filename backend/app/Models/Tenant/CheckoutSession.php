<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckoutSession extends Model
{
    protected $fillable = [
        'cart_id', 'customer_id', 'status', 'shipping_address_id',
        'shipping_method', 'payment_method', 'totals',
    ];

    protected function casts(): array
    {
        return ['totals' => 'array'];
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }
}
