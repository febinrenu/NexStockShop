<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Address;
use Illuminate\Http\Request;

/**
 * Shopper's own saved addresses (auth:customer). Discovered missing
 * while building the storefront's checkout flow: CheckoutController's
 * updateSession() requires a shipping_address_id referencing an existing
 * addresses row, but nothing let a shopper create one — checkout was
 * unreachable end-to-end without this.
 */
class AddressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user('customer')->addresses()->orderByDesc('is_default')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $customer = $request->user('customer');

        if ($data['is_default'] ?? false) {
            $customer->addresses()->update(['is_default' => false]);
        }

        $address = $customer->addresses()->create($data);

        return response()->json($address, 201);
    }

    public function update(Request $request, Address $address)
    {
        abort_unless($address->customer_id === $request->user('customer')->id, 403);

        $data = $this->validated($request, sometimes: true);

        if ($data['is_default'] ?? false) {
            $request->user('customer')->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($data);

        return response()->json($address);
    }

    public function destroy(Request $request, Address $address)
    {
        abort_unless($address->customer_id === $request->user('customer')->id, 403);

        $address->delete();

        return response()->json(null, 204);
    }

    private function validated(Request $request, bool $sometimes = false): array
    {
        $rule = fn (string $base) => $sometimes ? ['sometimes', ...explode('|', $base)] : explode('|', $base);

        return $request->validate([
            'label' => $sometimes ? ['sometimes', 'nullable', 'string', 'max:255'] : ['nullable', 'string', 'max:255'],
            'recipient_name' => $rule('required|string|max:255'),
            'phone' => $sometimes ? ['sometimes', 'nullable', 'string', 'max:32'] : ['nullable', 'string', 'max:32'],
            'line1' => $rule('required|string|max:255'),
            'line2' => $sometimes ? ['sometimes', 'nullable', 'string', 'max:255'] : ['nullable', 'string', 'max:255'],
            'city' => $rule('required|string|max:255'),
            'state' => $sometimes ? ['sometimes', 'nullable', 'string', 'max:255'] : ['nullable', 'string', 'max:255'],
            'postal_code' => $sometimes ? ['sometimes', 'nullable', 'string', 'max:32'] : ['nullable', 'string', 'max:32'],
            'country' => $rule('required|string|max:2'),
            'is_default' => ['sometimes', 'boolean'],
        ]);
    }
}
