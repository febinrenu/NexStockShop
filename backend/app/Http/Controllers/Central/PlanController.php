<?php

declare(strict_types=1);

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\Plan;
use Illuminate\Http\Request;

/**
 * Platform super-admin plan/pricing-tier management (§3: "Manage tenants,
 * plans, billing status" — "plan CRUD"). auth:platform only.
 */
class PlanController extends Controller
{
    public function index()
    {
        return response()->json(Plan::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:plans,slug'],
            'price_cents' => ['required', 'integer', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'billing_interval' => ['required', 'in:month,year'],
            'product_limit' => ['nullable', 'integer', 'min:0'],
            'staff_limit' => ['nullable', 'integer', 'min:0'],
            'feature_flags' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $plan = Plan::create($data);

        return response()->json($plan, 201);
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'price_cents' => ['sometimes', 'integer', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'billing_interval' => ['sometimes', 'in:month,year'],
            'product_limit' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'staff_limit' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'feature_flags' => ['sometimes', 'nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $plan->update($data);

        return response()->json($plan);
    }
}
