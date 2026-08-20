<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gives real effect to a platform admin suspending a tenant (§3 of the
 * Person A plan: "Manage tenants ... suspend"). 'pending' tenants are
 * still allowed through — they need authenticated access to finish
 * onboarding (branding, first product) before go-live.
 */
class EnsureTenantIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if (tenant('status') === 'suspended') {
            abort(403, 'This store has been suspended.');
        }

        return $next($request);
    }
}
