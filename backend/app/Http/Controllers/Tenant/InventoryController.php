<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\ProductVariant;
use Illuminate\Http\Request;

/**
 * Seller-admin stock adjustments (auth:tenant). Route param is named
 * `variant` for Laravel's implicit route-model binding but resolves the
 * same `/inventory/{variant_id}` URL the dashboard calls.
 */
class InventoryController extends Controller
{
    public function update(Request $request, ProductVariant $variant)
    {
        $data = $request->validate([
            'quantity_available' => ['required', 'integer', 'min:0'],
            'quantity_reserved' => ['sometimes', 'integer', 'min:0'],
        ]);

        $level = $variant->inventoryLevel ?? $variant->inventoryLevel()->create(['quantity_available' => 0, 'quantity_reserved' => 0]);
        $level->update($data);

        return response()->json($level);
    }
}
