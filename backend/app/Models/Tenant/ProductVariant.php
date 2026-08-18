<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ProductVariant extends Model
{
    protected $fillable = ['product_id', 'sku', 'attributes', 'is_default'];

    protected function casts(): array
    {
        return ['attributes' => 'array', 'is_default' => 'boolean'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inventoryLevel(): HasOne
    {
        return $this->hasOne(InventoryLevel::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(Price::class);
    }

    public function priceIn(string $currency): ?Price
    {
        return $this->prices->firstWhere('currency', $currency);
    }
}
