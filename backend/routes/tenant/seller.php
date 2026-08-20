<?php

declare(strict_types=1);

use App\Http\Controllers\Tenant\InventoryController;
use App\Http\Controllers\Tenant\ProductController;
use App\Http\Controllers\Tenant\SellerAnalyticsController;
use App\Http\Controllers\Tenant\SellerOrderController;
use App\Http\Controllers\Tenant\TenantSettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Seller-admin dashboard API (guard: tenant)
|--------------------------------------------------------------------------
|
| require()'d from routes/tenant.php, so every route below already has the
| 'api' + tenancy-init middleware and the /api/v1 prefix applied. Product
| writes share the /products path with commerce.php's public reads
| (differentiated by HTTP method); order management is under /seller/orders
| because /orders is already the customer-guard "my own orders" endpoint
| and Laravel can't route one method+path to two different guards.
|
*/

Route::middleware('auth:tenant')->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    Route::patch('/inventory/{variant}', [InventoryController::class, 'update']);

    Route::patch('/settings', [TenantSettingsController::class, 'update']);

    Route::prefix('seller')->group(function () {
        Route::get('/orders', [SellerOrderController::class, 'index']);
        Route::get('/orders/{order}', [SellerOrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [SellerOrderController::class, 'updateStatus']);

        Route::get('/analytics/summary', [SellerAnalyticsController::class, 'summary']);
    });
});
