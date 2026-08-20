<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Tenant\Product;

/**
 * Shapes a Product (+ its default variant) into the response the storefront
 * consumes — including the server-computed discount badge (§5 of the
 * Person A plan: "the frontend never computes a discount percentage itself").
 */
class ProductPresenter
{
    public static function present(Product $product, string $locale, string $currency): array
    {
        $translation = $product->translation($locale);
        $variant = $product->defaultVariant();
        $price = $variant?->priceIn($currency);
        $discount = $product->activeDiscountFor($variant?->id);

        $badge = null;
        if ($discount && $price) {
            $badge = $discount->type === 'percentage'
                ? "-{$discount->value}%"
                : '-'.self::formatMinor($discount->value, $currency);
        }

        return [
            'id' => $product->id,
            'sku' => $product->sku,
            'slug' => $product->slug,
            'status' => $product->status,
            'is_featured' => $product->is_featured,
            'locale' => $locale,
            'name' => $translation?->name,
            'description' => $translation?->description,
            'category_id' => $product->category_id,
            'brand_id' => $product->brand_id,
            'image_url' => $variant?->image_url,
            'price' => $price ? [
                'currency' => $price->currency,
                'amount_minor' => $price->amount_minor,
                'formatted' => self::formatMinor($price->amount_minor, $price->currency),
            ] : null,
            'discount_badge' => $badge,
            'variants' => $product->variants->map(fn ($v) => [
                'id' => $v->id,
                'sku' => $v->sku,
                'attributes' => $v->attributes,
                'image_url' => $v->image_url,
                'is_default' => $v->is_default,
                'in_stock' => $v->inventoryLevel?->inStock() ?? false,
                'price' => optional($v->priceIn($currency), fn ($p) => [
                    'currency' => $p->currency,
                    'amount_minor' => $p->amount_minor,
                    'formatted' => self::formatMinor($p->amount_minor, $p->currency),
                ]),
            ])->values(),
        ];
    }

    public static function formatMinor(int $amountMinor, string $currency): string
    {
        return number_format($amountMinor / 100, 2).' '.$currency;
    }
}
