<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CustomerProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user('customer')->only(['id', 'name', 'email', 'phone', 'preferred_locale']));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:32'],
            'preferred_locale' => ['sometimes', 'in:en,ar'],
        ]);

        $customer = $request->user('customer');
        $customer->update($data);

        return response()->json($customer->only(['id', 'name', 'email', 'phone', 'preferred_locale']));
    }
}
