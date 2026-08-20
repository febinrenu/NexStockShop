<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Product;
use App\Support\Localization;
use App\Support\ProductPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Public catalog reads (index/show) plus seller-admin write operations
 * (store/update/destroy — auth:tenant, see routes/tenant/seller.php).
 */
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

    public function store(Request $request)
    {
        $data = $request->validate([
            'sku' => ['required', 'string', 'max:255', 'unique:products,sku'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'status' => ['sometimes', 'in:draft,active,archived'],
            'is_featured' => ['sometimes', 'boolean'],
            'translations' => ['required', 'array', 'min:1'],
            'translations.*.locale' => ['required', 'string', 'max:8'],
            'translations.*.name' => ['required', 'string', 'max:255'],
            'translations.*.description' => ['nullable', 'string'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.sku' => ['required', 'string', 'max:255', 'distinct', 'unique:product_variants,sku'],
            'variants.*.attributes' => ['nullable', 'array'],
            'variants.*.image_url' => ['nullable', 'url', 'max:2048'],
            'variants.*.is_default' => ['sometimes', 'boolean'],
            'variants.*.prices' => ['required', 'array', 'min:1'],
            'variants.*.prices.*.currency' => ['required', 'string', 'size:3'],
            'variants.*.prices.*.amount_minor' => ['required', 'integer', 'min:0'],
            'variants.*.inventory.quantity_available' => ['sometimes', 'integer', 'min:0'],
        ]);

        $product = DB::transaction(function () use ($data) {
            $product = Product::create([
                'category_id' => $data['category_id'] ?? null,
                'brand_id' => $data['brand_id'] ?? null,
                'sku' => $data['sku'],
                'slug' => $data['slug'],
                'status' => $data['status'] ?? 'draft',
                'is_featured' => $data['is_featured'] ?? false,
            ]);

            foreach ($data['translations'] as $translation) {
                $product->translations()->create($translation);
            }

            foreach ($data['variants'] as $variantData) {
                $variant = $product->variants()->create([
                    'sku' => $variantData['sku'],
                    'attributes' => $variantData['attributes'] ?? null,
                    'image_url' => $variantData['image_url'] ?? null,
                    'is_default' => $variantData['is_default'] ?? false,
                ]);

                foreach ($variantData['prices'] as $price) {
                    $variant->prices()->create($price);
                }

                $variant->inventoryLevel()->create([
                    'quantity_available' => $variantData['inventory']['quantity_available'] ?? 0,
                ]);
            }

            return $product;
        });

        $product->load(['translations', 'variants.prices', 'variants.inventoryLevel', 'discounts']);
        $locale = Localization::resolve($request);
        $currency = $request->query('currency', tenant('default_currency') ?? 'USD');

        return response()->json(ProductPresenter::present($product, $locale, $currency), 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'sku' => ['sometimes', 'string', 'max:255', 'unique:products,sku,'.$product->id],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:products,slug,'.$product->id],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'brand_id' => ['sometimes', 'nullable', 'integer', 'exists:brands,id'],
            'status' => ['sometimes', 'in:draft,active,archived'],
            'is_featured' => ['sometimes', 'boolean'],
            'translations' => ['sometimes', 'array', 'min:1'],
            'translations.*.locale' => ['required_with:translations', 'string', 'max:8'],
            'translations.*.name' => ['required_with:translations', 'string', 'max:255'],
            'translations.*.description' => ['nullable', 'string'],
        ]);

        $translations = $data['translations'] ?? null;
        unset($data['translations']);

        DB::transaction(function () use ($product, $data, $translations) {
            $product->update($data);

            foreach ($translations ?? [] as $translation) {
                $product->translations()->updateOrCreate(
                    ['locale' => $translation['locale']],
                    ['name' => $translation['name'], 'description' => $translation['description'] ?? null],
                );
            }
        });

        $product->load(['translations', 'variants.prices', 'variants.inventoryLevel', 'discounts']);
        $locale = Localization::resolve($request);
        $currency = $request->query('currency', tenant('default_currency') ?? 'USD');

        return response()->json(ProductPresenter::present($product, $locale, $currency));
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(null, 204);
    }
}
