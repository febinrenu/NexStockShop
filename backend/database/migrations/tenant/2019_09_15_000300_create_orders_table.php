<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('checkout_session_id')->nullable()->constrained('checkout_sessions')->nullOnDelete();
            $table->string('status')->default('pending'); // pending|paid|fulfilled|cancelled|refunded
            $table->string('currency', 3);
            $table->unsignedInteger('subtotal_minor');
            $table->unsignedInteger('discount_minor')->default(0);
            $table->unsignedInteger('shipping_minor')->default(0);
            $table->unsignedInteger('total_minor');
            $table->foreignId('shipping_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->timestamp('placed_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
