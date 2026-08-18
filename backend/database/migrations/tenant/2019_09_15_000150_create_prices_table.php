<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->string('currency', 3); // CFA|USD|SAR
            // Minor-unit integer (cents), never a float — avoids rounding
            // bugs across three currencies with different subunit conventions.
            $table->unsignedInteger('amount_minor');
            $table->timestamps();

            $table->unique(['product_variant_id', 'currency']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prices');
    }
};
