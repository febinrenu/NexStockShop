<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Product;
use App\Models\Tenant\ProductTranslation;
use App\Support\Localization;
use App\Support\ProductPresenter;
use Illuminate\Http\Request;

/**
 * Full-text search over product translations. Starts as a plain LIKE query
 * (works identically on the MySQL/MariaDB and Postgres options the plan
 * leaves open); swappable for a dedicated search service later without the
 * route contract (?q=) changing.
 */
class SearchController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['q' => ['required', 'string', 'min:1']]);

        $locale = Localization::resolve($request);
        $currency = $request->query('currency', tenant('default_currency') ?? 'USD');
        $q = $request->query('q');

        $productIds = ProductTranslation::query()
            ->where('locale', $locale)
            ->where(fn ($query) => $query->where('name', 'like', "%{$q}%")->orWhere('description', 'like', "%{$q}%"))
            ->pluck('product_id');

        $products = Product::query()
            ->with(['translations', 'variants.prices', 'variants.inventoryLevel', 'discounts'])
            ->whereIn('id', $productIds)
            ->where('status', 'active')
            ->paginate((int) $request->query('per_page', 24));

        return response()->json([
            'data' => $products->getCollection()->map(fn (Product $p) => ProductPresenter::present($p, $locale, $currency))->values(),
            'meta' => ['current_page' => $products->currentPage(), 'last_page' => $products->lastPage(), 'total' => $products->total()],
            'query' => $q,
        ]);
    }
}
