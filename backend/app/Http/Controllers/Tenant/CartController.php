<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Cart;
use App\Models\Tenant\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Guest carts are identified by an opaque `X-Guest-Token` header the
 * storefront generates and persists client-side; a logged-in shopper's
 * cart is resolved by customer_id instead. No tenant ID appears anywhere
 * here — the active tenant DB connection already scopes every query.
 */
class CartController extends Controller
{
    private function resolveCart(Request $request, bool $createIfMissing = true): ?Cart
    {
        $customer = $request->user('customer');

        if ($customer) {
            $cart = Cart::where('customer_id', $customer->id)->where('status', 'active')->first();

            return $cart ?? ($createIfMissing ? Cart::create([
                'customer_id' => $customer->id,
                'currency' => $request->query('currency', tenant('default_currency') ?? 'USD'),
            ]) : null);
        }

        $guestToken = $request->header('X-Guest-Token');
        $cart = $guestToken ? Cart::where('guest_token', $guestToken)->where('status', 'active')->first() : null;

        if (! $cart && $createIfMissing) {
            $cart = Cart::create([
                'guest_token' => $guestToken ?: (string) Str::uuid(),
                'currency' => $request->query('currency', tenant('default_currency') ?? 'USD'),
            ]);
        }

        return $cart;
    }

    public function show(Request $request)
    {
        $cart = $this->resolveCart($request);

        return $this->cartResponse($cart);
    }

    public function addItem(Request $request)
    {
        $data = $request->validate([
            'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = $this->resolveCart($request);
        $variant = ProductVariant::findOrFail($data['product_variant_id']);
        $price = $variant->priceIn($cart->currency);

        $item = $cart->items()->where('product_variant_id', $variant->id)->first();

        if ($item) {
            $item->update(['quantity' => $item->quantity + $data['quantity']]);
        } else {
            $cart->items()->create([
                'product_variant_id' => $variant->id,
                'quantity' => $data['quantity'],
                'unit_price_minor' => $price?->amount_minor ?? 0,
            ]);
        }

        return $this->cartResponse($cart->fresh());
    }

    public function updateItem(Request $request, int $itemId)
    {
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1']]);

        $cart = $this->resolveCart($request, createIfMissing: false);
        $item = $cart?->items()->where('id', $itemId)->firstOrFail();
        $item?->update(['quantity' => $data['quantity']]);

        return $this->cartResponse($cart->fresh());
    }

    public function removeItem(Request $request, int $itemId)
    {
        $cart = $this->resolveCart($request, createIfMissing: false);
        $cart?->items()->where('id', $itemId)->delete();

        return $this->cartResponse($cart?->fresh());
    }

    public function destroy(Request $request)
    {
        $cart = $this->resolveCart($request, createIfMissing: false);
        $cart?->items()->delete();

        return response()->json(['message' => 'Cart cleared.']);
    }

    private function cartResponse(?Cart $cart)
    {
        if (! $cart) {
            return response()->json(['items' => [], 'subtotal_minor' => 0]);
        }

        return response()->json([
            'id' => $cart->id,
            'guest_token' => $cart->guest_token,
            'currency' => $cart->currency,
            'items' => $cart->items()->with('productVariant')->get(),
            'subtotal_minor' => $cart->subtotalMinor(),
        ]);
    }
}
