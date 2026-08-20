<?php

declare(strict_types=1);

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\Tenant;
use Illuminate\Http\Request;

/**
 * Platform super-admin tenant management (§3 of the Person A plan:
 * "Manage tenants ... tenant list/suspend"). auth:platform only.
 */
class TenantManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Tenant::query()->with(['domains', 'subscription.plan']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    // Manually resolved (not implicit Eloquent binding) to match the
    // convention SignupController already established for this same
    // {tenant} route parameter name.
    public function show(string $tenant)
    {
        $t = Tenant::findOrFail($tenant);

        return response()->json($t->load(['domains', 'subscription.plan']));
    }

    public function update(Request $request, string $tenant)
    {
        $data = $request->validate([
            // 'pending' is set by signup/onboarding itself, not by this
            // endpoint — a super-admin only ever activates or suspends.
            'status' => ['required', 'in:active,suspended'],
        ]);

        $t = Tenant::findOrFail($tenant);
        $t->update($data);

        return response()->json($t);
    }
}
