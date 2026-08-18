<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTenantsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id')->primary();

            // Store identity & branding (§2.1 of the Person A plan).
            $table->string('name');
            $table->string('status')->default('pending'); // pending|active|suspended
            $table->string('branding_logo_url')->nullable();
            $table->string('branding_theme')->default('default');
            $table->string('branding_primary_color')->nullable();
            $table->string('default_locale', 8)->default('en');
            $table->string('default_currency', 3)->default('USD');
            $table->timestamp('trial_ends_at')->nullable();

            $table->timestamps();
            $table->json('data')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
}
