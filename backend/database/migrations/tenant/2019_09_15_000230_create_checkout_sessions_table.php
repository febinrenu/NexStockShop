<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkout_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained('carts')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('status')->default('started'); // started|address|shipping|payment|complete
            $table->foreignId('shipping_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->string('shipping_method')->nullable();
            $table->string('payment_method')->nullable();
            $table->json('totals')->nullable(); // {subtotal, discount, shipping, total} snapshot, minor units
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_sessions');
    }
};
