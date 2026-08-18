<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Central\ModerationFlag;
use App\Models\Tenant\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:5000'],
        ]);

        $review = Review::create([
            ...$data,
            'customer_id' => $request->user('customer')->id,
            'status' => 'pending',
        ]);

        // New reviews land in the central moderation queue rather than
        // publishing immediately — the Workstream E review-queue UI reads
        // from this same table (App\Models\Central\ModerationFlag).
        ModerationFlag::create([
            'flaggable_type' => Review::class,
            'flaggable_id' => (string) $review->id,
            'tenant_id' => tenant('id'),
            'reason' => 'New review pending approval',
            'status' => 'pending',
            'source' => 'auto',
        ]);

        return response()->json($review, 201);
    }
}
