<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlist = Wishlist::firstOrCreate(
            ['customer_id' => $request->user('customer')->id],
            ['name' => 'My Wishlist'],
        );

        return response()->json($wishlist->load('items.productVariant.product'));
    }

    public function store(Request $request)
    {
        $data = $request->validate(['product_variant_id' => ['required', 'integer', 'exists:product_variants,id']]);

        $wishlist = Wishlist::firstOrCreate(
            ['customer_id' => $request->user('customer')->id],
            ['name' => 'My Wishlist'],
        );
        $wishlist->items()->firstOrCreate(['product_variant_id' => $data['product_variant_id']]);

        return response()->json($wishlist->load('items.productVariant.product'), 201);
    }

    public function destroy(Request $request, int $itemId)
    {
        $wishlist = Wishlist::where('customer_id', $request->user('customer')->id)->firstOrFail();
        $wishlist->items()->where('id', $itemId)->delete();

        return response()->json(['message' => 'Removed.']);
    }
}
