<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Shopper auth (guard: customer).
 */
class CustomerAuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:customers,email'],
            'password' => ['required', 'string', 'min:8'],
            'preferred_locale' => ['nullable', 'in:en,ar'],
        ]);

        $customer = Customer::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'preferred_locale' => $data['preferred_locale'] ?? 'en',
        ]);

        return response()->json([
            'token' => $customer->createToken('customer')->plainTextToken,
            'customer' => $customer->only(['id', 'name', 'email', 'preferred_locale']),
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $customer = Customer::where('email', $data['email'])->first();

        if (! $customer || ! Hash::check($data['password'], $customer->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        return response()->json([
            'token' => $customer->createToken('customer')->plainTextToken,
            'customer' => $customer->only(['id', 'name', 'email', 'preferred_locale']),
        ]);
    }

    public function passwordReset(Request $request)
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $request->user('customer')->update(['password' => $data['password']]);

        return response()->json(['message' => 'Password updated.']);
    }

    public function logout(Request $request)
    {
        $request->user('customer')->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}
