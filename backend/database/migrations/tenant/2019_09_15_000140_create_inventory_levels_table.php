<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->unique()->constrained('product_variants')->cascadeOnDelete();
            $table->unsignedInteger('quantity_available')->default(0);
            $table->unsignedInteger('quantity_reserved')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_levels');
    }
};
