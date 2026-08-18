<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Product;
use App\Support\Localization;
use App\Support\ProductPresenter;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $locale = Localization::resolve($request);
        $currency = $request->query('currency', tenant('default_currency') ?? 'USD');

        $query = Product::query()
            ->with(['translations', 'variants.prices', 'variants.inventoryLevel', 'discounts'])
            ->where('status', 'active');

        if ($categoryId = $request->query('filter.category_id', $request->query('filter')['category_id'] ?? null)) {
            $query->where('category_id', $categoryId);
        }

        if ($brandId = $request->query('filter.brand_id', $request->query('filter')['brand_id'] ?? null)) {
            $query->where('brand_id', $brandId);
        }

        $sort = $request->query('sort', '-created_at');
        $sortColumn = ltrim($sort, '-');
        if (in_array($sortColumn, ['created_at', 'sku'], true)) {
            $query->orderBy($sortColumn, str_starts_with($sort, '-') ? 'desc' : 'asc');
        }

        $products = $query->paginate((int) $request->query('per_page', 24));

        return response()->json([
            'data' => $products->getCollection()->map(fn (Product $p) => ProductPresenter::present($p, $locale, $currency))->values(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
            'locale' => $locale,
            'currency' => $currency,
        ]);
    }

    public function show(Request $request, Product $product)
    {
        $locale = Localization::resolve($request);
        $currency = $request->query('currency', tenant('default_currency') ?? 'USD');

        $product->load(['translations', 'variants.prices', 'variants.inventoryLevel', 'discounts']);

        return response()->json(ProductPresenter::present($product, $locale, $currency));
    }
}
