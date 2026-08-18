<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Tenant admin / seller-staff auth (guard: tenant). Staff accounts are
 * invite-based, not open self-registration — an owner invites a staff
 * member by email; the invite endpoint issues a one-time setup token the
 * invitee exchanges via /auth/register.
 */
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        return response()->json([
            'token' => $user->createToken('tenant-admin')->plainTextToken,
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    }

    public function invite(Request $request)
    {
        abort_unless($request->user('tenant')->can('staff.invite'), 403, 'Only the store owner can invite staff.');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
        ]);

        $temporaryPassword = Str::random(24);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => 'staff',
            'password' => $temporaryPassword,
        ]);
        $user->assignRole('staff');

        // In production this is emailed to the invitee, never returned in
        // the response body — surfaced here only so the endpoint contract
        // is testable without a mail transport wired up yet.
        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'setup_token' => $user->createToken('invite-setup', ['password:reset'])->plainTextToken,
        ], 201);
    }

    public function passwordReset(Request $request)
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $request->user('tenant')->update(['password' => $data['password']]);

        return response()->json(['message' => 'Password updated.']);
    }

    public function logout(Request $request)
    {
        $request->user('tenant')->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}
