<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['category_id', 'brand_id', 'sku', 'slug', 'status', 'is_featured'];

    protected function casts(): array
    {
        return ['is_featured' => 'boolean'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(ProductTranslation::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function discounts(): HasMany
    {
        return $this->hasMany(Discount::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function translation(string $locale = 'en'): ?ProductTranslation
    {
        return $this->translations->firstWhere('locale', $locale)
            ?? $this->translations->firstWhere('locale', 'en');
    }

    public function defaultVariant(): ?ProductVariant
    {
        return $this->variants->firstWhere('is_default', true) ?? $this->variants->first();
    }

    /**
     * Active discount for a given variant (or the product generally, when
     * $variantId is null), used to compute the "-14%" style badge server-side
     * so the storefront never derives pricing logic itself.
     */
    public function activeDiscountFor(?int $variantId = null): ?Discount
    {
        $now = now();

        return $this->discounts
            ->filter(fn (Discount $d) => $d->is_active
                && (! $d->starts_at || $d->starts_at->lte($now))
                && (! $d->ends_at || $d->ends_at->gte($now))
                && ($d->product_variant_id === null || $d->product_variant_id === $variantId))
            ->sortByDesc('value')
            ->first();
    }
}
