<?php

declare(strict_types=1);

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\PlatformSetting;
use Illuminate\Http\Request;

/**
 * Workstream E — Platform Settings (brief §4.5). Super-admin guard only.
 */
class PlatformSettingController extends Controller
{
    public function index()
    {
        return response()->json(
            PlatformSetting::all(['key', 'value'])->pluck('value', 'key')
        );
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
        ]);

        foreach ($data['settings'] as $key => $value) {
            PlatformSetting::set($key, $value);
        }

        return response()->json(
            PlatformSetting::all(['key', 'value'])->pluck('value', 'key')
        );
    }
}
