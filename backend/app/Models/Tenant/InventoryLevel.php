<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryLevel extends Model
{
    protected $fillable = ['product_variant_id', 'quantity_available', 'quantity_reserved'];

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function inStock(): bool
    {
        return $this->quantity_available - $this->quantity_reserved > 0;
    }
}
