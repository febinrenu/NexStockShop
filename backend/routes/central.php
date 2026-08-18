<?php

declare(strict_types=1);

use App\Http\Controllers\Central\AuthController;
use App\Http\Controllers\Central\BillingController;
use App\Http\Controllers\Central\ModerationController;
use App\Http\Controllers\Central\PlatformSettingController;
use App\Http\Controllers\Central\SignupController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Central Routes (guard: platform)
|--------------------------------------------------------------------------
|
| These only ever run on a central domain (see CENTRAL_DOMAINS) and are
| loaded via bootstrap/app.php's routing `then` callback, deliberately
| outside the tenancy-initializing middleware used by routes/tenant.php.
|
*/

Route::prefix('api/v1/central')->group(function () {
    // Store signup / onboarding — public, unauthenticated.
    Route::post('/signup', [SignupController::class, 'signup']);
    Route::post('/onboarding/{tenant}/theme', [SignupController::class, 'theme']);
    Route::post('/onboarding/{tenant}/go-live', [SignupController::class, 'goLive']);

    // Subscription billing (§2.5) — subscribe kicks off a Stripe Checkout
    // session; webhook is called by Stripe itself (verified by signature,
    // not a guard) so it must stay unauthenticated.
    Route::post('/billing/subscribe', [BillingController::class, 'subscribe']);
    Route::post('/billing/webhook', [BillingController::class, 'webhook']);

    // Platform super-admin auth.
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:platform')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        Route::get('/platform/settings', [PlatformSettingController::class, 'index']);
        Route::patch('/platform/settings', [PlatformSettingController::class, 'update']);

        Route::get('/platform/moderation-queue', [ModerationController::class, 'index']);
        Route::post('/platform/moderation-queue/{flag}/action', [ModerationController::class, 'action']);
    });
});
