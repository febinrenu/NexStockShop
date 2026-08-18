<?php

declare(strict_types=1);

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\PlatformAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Platform super-admin auth (guard: platform).
 */
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = PlatformAdmin::where('email', $data['email'])->first();

        if (! $admin || ! Hash::check($data['password'], $admin->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        return response()->json([
            'token' => $admin->createToken('platform-admin')->plainTextToken,
            'admin' => $admin->only(['id', 'name', 'email']),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user('platform')->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user('platform')->only(['id', 'name', 'email']));
    }
}
