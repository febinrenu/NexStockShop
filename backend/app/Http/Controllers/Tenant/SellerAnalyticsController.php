<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Order;
use App\Models\Tenant\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Seller-admin sales/revenue aggregates (auth:tenant). Revenue is grouped
 * by currency rather than summed into one figure — orders can be placed
 * in any of the tenant's supported currencies (§4 of the Person A plan:
 * multi-currency is a stored currency code + minor-unit amount, never
 * mixed/converted implicitly).
 */
class SellerAnalyticsController extends Controller
{
    public function summary(Request $request)
    {
        $from = $request->query('from') ? Carbon::parse($request->query('from'))->startOfDay() : now()->subDays(30)->startOfDay();
        $to = $request->query('to') ? Carbon::parse($request->query('to'))->endOfDay() : now()->endOfDay();

        $orders = Order::whereBetween('placed_at', [$from, $to])->where('status', '!=', 'cancelled');

        // MySQL/MariaDB return SUM()/COUNT() through PDO as numeric strings,
        // not ints — cast explicitly so the API contract is actually typed.
        $revenueByCurrency = (clone $orders)
            ->selectRaw('currency, SUM(total_minor) as amount_minor, COUNT(*) as orders_count')
            ->groupBy('currency')
            ->get()
            ->map(fn ($row) => [
                'currency' => $row->currency,
                'amount_minor' => (int) $row->amount_minor,
                'orders_count' => (int) $row->orders_count,
            ]);

        $orderIds = (clone $orders)->pluck('id');

        $topProducts = OrderItem::query()
            ->whereIn('order_id', $orderIds)
            ->selectRaw('product_variant_id, product_name, SUM(quantity) as quantity_sold, SUM(line_total_minor) as revenue_minor')
            ->groupBy('product_variant_id', 'product_name')
            ->orderByDesc('quantity_sold')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'product_variant_id' => $row->product_variant_id,
                'product_name' => $row->product_name,
                'quantity_sold' => (int) $row->quantity_sold,
                'revenue_minor' => (int) $row->revenue_minor,
            ]);

        return response()->json([
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'revenue_by_currency' => $revenueByCurrency,
            'orders_count' => $orderIds->count(),
            'top_products' => $topProducts,
        ]);
    }
}
