<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Discovered missing while building the storefront frontend: nothing in
 * the schema stored a product image anywhere, yet every NexStock mockup
 * page (Shop, Product Details, Cart, Wishlist, Deals) shows one
 * prominently. Per-variant rather than per-product — a color/style
 * variant plausibly has its own photo, matching how pricing/inventory
 * already vary per variant, not per product.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('image_url')->nullable()->after('attributes');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('image_url');
        });
    }
};
