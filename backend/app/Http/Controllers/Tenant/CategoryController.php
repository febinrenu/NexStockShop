<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Category;
use App\Support\Localization;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $locale = Localization::resolve($request);

        $categories = Category::with('translations')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'parent_id' => $c->parent_id,
                'slug' => $c->slug,
                'name' => $c->translation($locale)?->name,
                'description' => $c->translation($locale)?->description,
            ]);

        return response()->json(['data' => $categories, 'locale' => $locale]);
    }
}
