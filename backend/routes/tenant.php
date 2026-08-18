<?php

declare(strict_types=1);

use App\Http\Controllers\Tenant\AuthController;
use App\Http\Controllers\Tenant\CustomerAuthController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes (guards: tenant, customer)
|--------------------------------------------------------------------------
|
| Loaded automatically by TenancyServiceProvider for every request that
| resolves to a tenant domain. InitializeTenancyByDomain swaps the default
| DB connection (and cache/filesystem/queue) to this tenant's own database
| BEFORE any controller here runs — see §2.3 of the Person A plan for the
| full mechanics. 'api' (not 'web') because this project is API-only.
|
*/

Route::middleware([
    'api',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->prefix('api/v1')->group(function () {

    // --- Tenant admin / seller-staff auth (guard: tenant) ---
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::middleware('auth:tenant')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/invite', [AuthController::class, 'invite']);
            Route::post('/password-reset', [AuthController::class, 'passwordReset']);
        });
    });

    // --- Shopper auth (guard: customer) ---
    Route::prefix('customer/auth')->group(function () {
        Route::post('/register', [CustomerAuthController::class, 'register']);
        Route::post('/login', [CustomerAuthController::class, 'login']);
        Route::middleware('auth:customer')->group(function () {
            Route::post('/logout', [CustomerAuthController::class, 'logout']);
            Route::post('/password-reset', [CustomerAuthController::class, 'passwordReset']);
        });
    });

    require __DIR__.'/tenant/commerce.php';
});
