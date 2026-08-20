<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Order;
use Illuminate\Http\Request;

/**
 * Seller-admin order management (auth:tenant) — every order in this
 * tenant's store, not just the caller's own. Deliberately under
 * /seller/orders rather than /orders: that path is already taken by the
 * customer-guard "my own orders" endpoint in commerce.php, and Laravel
 * can't route the same method+path to two different guards.
 */
class SellerOrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::query()
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest('placed_at')
            ->paginate((int) $request->query('per_page', 20));

        return response()->json($orders);
    }

    public function show(Order $order)
    {
        return response()->json($order->load(['items', 'shipment', 'statusHistory', 'customer']));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            // Matches the `status` column comment on the orders migration.
            'status' => ['required', 'in:pending,paid,fulfilled,cancelled,refunded'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $order->recordStatus($data['status'], $data['note'] ?? null);

        return response()->json($order->fresh(['statusHistory']));
    }
}
