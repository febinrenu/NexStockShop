<?php

declare(strict_types=1);

use App\Http\Controllers\Tenant\BrandController;
use App\Http\Controllers\Tenant\CartController;
use App\Http\Controllers\Tenant\CategoryController;
use App\Http\Controllers\Tenant\CheckoutController;
use App\Http\Controllers\Tenant\CustomerProfileController;
use App\Http\Controllers\Tenant\NewsletterController;
use App\Http\Controllers\Tenant\OrderController;
use App\Http\Controllers\Tenant\ProductController;
use App\Http\Controllers\Tenant\ReviewController;
use App\Http\Controllers\Tenant\SearchController;
use App\Http\Controllers\Tenant\TenantSettingsController;
use App\Http\Controllers\Tenant\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Commerce API (§5 of the Person A plan)
|--------------------------------------------------------------------------
|
| require()'d from inside routes/tenant.php's Route::middleware(...)->group()
| closure, so every route below already has the 'api' + tenancy-init
| middleware and the /api/v1 prefix applied.
|
*/

// --- Tenant settings (public) ---
Route::get('/settings', [TenantSettingsController::class, 'show']);

// --- Catalog (public) ---
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/search', [SearchController::class, 'index']);

// --- Newsletter (public) ---
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::post('/newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);

// --- Cart (public — guest or authenticated shopper) ---
Route::get('/cart', [CartController::class, 'show']);
Route::post('/cart/items', [CartController::class, 'addItem']);
Route::patch('/cart/items/{itemId}', [CartController::class, 'updateItem']);
Route::delete('/cart/items/{itemId}', [CartController::class, 'removeItem']);
Route::delete('/cart', [CartController::class, 'destroy']);

// --- Checkout (public — guest or authenticated shopper) ---
Route::post('/checkout/session', [CheckoutController::class, 'createSession']);
Route::patch('/checkout/session/{session}', [CheckoutController::class, 'updateSession']);
Route::post('/checkout/session/{session}/complete', [CheckoutController::class, 'complete']);

// --- Customer-only (guard: customer) ---
Route::middleware('auth:customer')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::get('/orders/{order}/tracking', [OrderController::class, 'tracking']);

    Route::get('/me', [CustomerProfileController::class, 'show']);
    Route::patch('/me', [CustomerProfileController::class, 'update']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{itemId}', [WishlistController::class, 'destroy']);

    Route::post('/reviews', [ReviewController::class, 'store']);
});
