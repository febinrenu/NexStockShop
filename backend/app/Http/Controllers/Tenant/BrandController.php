<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Brand;

class BrandController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Brand::where('is_active', true)->get(['id', 'name', 'slug', 'logo_url']),
        ]);
    }
}
