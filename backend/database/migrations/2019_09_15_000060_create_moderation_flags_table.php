<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moderation_flags', function (Blueprint $table) {
            $table->id();
            // Polymorphic reference to the flagged entity, which may live in
            // a tenant database (product, review) or the central database
            // (tenant itself) — flaggable_type carries a fully-qualified
            // class name, flaggable_id its primary key.
            $table->string('flaggable_type');
            $table->string('flaggable_id');
            $table->string('tenant_id')->nullable();
            $table->string('reason');
            $table->string('status')->default('pending'); // pending|actioned|dismissed
            $table->string('source')->default('manual'); // manual|auto
            $table->unsignedBigInteger('actioned_by')->nullable();
            $table->timestamp('actioned_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            $table->index(['flaggable_type', 'flaggable_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moderation_flags');
    }
};
