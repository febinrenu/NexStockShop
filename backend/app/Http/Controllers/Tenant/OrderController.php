<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('customer_id', $request->user('customer')->id)
            ->latest('placed_at')
            ->paginate(20);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order)
    {
        abort_unless($order->customer_id === $request->user('customer')->id, 403);

        return response()->json($order->load(['items', 'shipment']));
    }

    public function tracking(Request $request, Order $order)
    {
        abort_unless($order->customer_id === $request->user('customer')->id, 403);

        return response()->json([
            'order_number' => $order->order_number,
            'status' => $order->status,
            'history' => $order->statusHistory,
            'shipment' => $order->shipment,
        ]);
    }
}
