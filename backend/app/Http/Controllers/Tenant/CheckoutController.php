<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Cart;
use App\Models\Tenant\CheckoutSession;
use App\Models\Tenant\Order;
use App\Models\Tenant\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Multi-step checkout (§4/§5 of the Person A plan). Person D wires the
 * actual payment-provider call in on top of `complete()`; this controller
 * owns the cart→order transition and totals snapshot.
 */
class CheckoutController extends Controller
{
    public function createSession(Request $request)
    {
        $data = $request->validate(['cart_id' => ['required', 'integer', 'exists:carts,id']]);

        $cart = Cart::with('items')->findOrFail($data['cart_id']);

        $session = CheckoutSession::create([
            'cart_id' => $cart->id,
            'customer_id' => $request->user('customer')?->id,
            'status' => 'started',
            'totals' => ['subtotal_minor' => $cart->subtotalMinor()],
        ]);

        return response()->json($session);
    }

    public function updateSession(Request $request, CheckoutSession $session)
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:address,shipping,payment,complete'],
            'shipping_address_id' => ['sometimes', 'integer', 'exists:addresses,id'],
            'shipping_method' => ['sometimes', 'string'],
            'payment_method' => ['sometimes', 'string'],
        ]);

        $session->update($data);

        return response()->json($session);
    }

    public function complete(Request $request, CheckoutSession $session)
    {
        $cart = $session->cart()->with('items.productVariant')->firstOrFail();

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty.'], 422);
        }

        $order = DB::transaction(function () use ($cart, $session) {
            $subtotal = $cart->subtotalMinor();

            $order = Order::create([
                'order_number' => 'ORD-'.strtoupper(Str::random(10)),
                'customer_id' => $session->customer_id,
                'checkout_session_id' => $session->id,
                'status' => 'paid',
                'currency' => $cart->currency,
                'subtotal_minor' => $subtotal,
                'total_minor' => $subtotal,
                'shipping_address_id' => $session->shipping_address_id,
                'placed_at' => now(),
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->productVariant?->product?->translation()?->name ?? $item->productVariant?->sku,
                    'sku' => $item->productVariant?->sku,
                    'quantity' => $item->quantity,
                    'unit_price_minor' => $item->unit_price_minor,
                    'line_total_minor' => $item->unit_price_minor * $item->quantity,
                ]);
            }

            $order->recordStatus('paid', 'Order placed and paid.');

            $cart->update(['status' => 'converted']);
            $session->update(['status' => 'complete']);

            return $order;
        });

        return response()->json($order->load('items'), 201);
    }
}
