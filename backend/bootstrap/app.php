<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Central (platform) API — signup/onboarding, platform-admin
            // auth, platform settings, moderation queue. Tenant API routes
            // live in routes/tenant.php, auto-loaded by
            // App\Providers\TenancyServiceProvider with the tenancy
            // bootstrapping middleware already applied.
            Route::middleware('api')->group(base_path('routes/central.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
